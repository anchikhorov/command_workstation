import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
//import { Subscription } from 'rxjs';
import * as _ from "lodash";
import { Job } from './job.model';
import { JobsService } from './jobs.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CookieService } from 'ngx-cookie-service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { JobPreviewComponent } from './job-preview/job-preview.component';
import { JobPropertiesComponent } from './job-properties/job-properties.component';
import { WebSocketService } from '../web-socket.service';


@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit, OnDestroy {
  jobs: Job[] = [];
  img: SafeUrl | null = null;
  displayedColumns: string[] = ['baseId','jobname', 'user', 'size', 'pages', 'created', 'printer', 'foldprogram', 'state'];
  clickedRow = new Set<PeriodicElement>();
  loading = false
  isRowAndImageIdEqual = false
  session: string = ''
  deleted!: number
  properties: any[] = []

  constructor(
    private jobservice: JobsService,
    private sanitizer: DomSanitizer,
    private cookieService: CookieService,
    public dialog: MatDialog,
    private webSocketService: WebSocketService
  ) { }

  ngOnInit(): void {

    this.webSocketService.listen('jobs').subscribe(data =>{
      this.jobs = JSON.parse(String(data))
    })
    this.webSocketService.listen('session').subscribe(data =>{
      this.session = String(data)
      console.log(this.session)
    })

    this.webSocketService.listen('previewSmall').subscribe(response =>{
      let data = JSON.parse(String(response))
      this.img = this.sanitizer.bypassSecurityTrustUrl(data['dataUrl']);
      this.loading = false
      if (data['jobid'] != this.deleted){
        this.isRowAndImageIdEqual = true
        this.jobservice.smallPreviewImages.set(data['jobid'], data['dataUrl'])
        
      }


    })

    this.webSocketService.listen('resume').subscribe(data =>{
      console.log(data)

    })

    this.webSocketService.listen('delete').subscribe(data =>{
      this.clickedRow.clear();
      this.isRowAndImageIdEqual = false
      this.img = null
      this.loading = false

    })

    // this.webSocketService.listen('properties').subscribe((response) =>{
    //   this.properties = JSON.parse(String(response))
    //   //console.log(responseData[0]['rotate_to_orientation'])

    // })
  }


  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };


  onContextMenu(event: MouseEvent, row: PeriodicElement) {
    this.onRowClick(row)
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = { 'row': row };
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  onContextMenuResume(row: PeriodicElement) {
    let request = {
      session: this.session,
      jobid: row.id
    }
    this.webSocketService.emit('resume',JSON.stringify(request))
  }

  onContextMenuDelete(row: PeriodicElement) {

    let request = {
      session: this.session,
      jobid: row.id
    }
    this.webSocketService.emit('delete',JSON.stringify(request))
    this.jobservice.smallPreviewImages.delete(row.id)
    this.deleted = row.id
  }


  onContextMenuPreview(row: PeriodicElement) {
    this.openBigPreview(row.id)
     
  }

  onContextMenuProperties(row: PeriodicElement) {
    this.openProperties(row.id, row.baseId)
        //this.webSocketService.emit('properties',String(row.id))
  }

  onRowClick(row: PeriodicElement) {
    if (!this.isRowsEqual(row)) {
      this.clickedRow.clear();
      this.clickedRow.add(row)
      if (this.jobservice.smallPreviewImages.has(row.id) && (row.id != this.deleted)) {
        this.img = this.jobservice.smallPreviewImages.get(row.id);
        this.loading = false
        this.isRowAndImageIdEqual = true
      } else {
        this.getPreview(row.id)
      }
    }
  }

  getPreview(id: number) {
    this.loading = true
    let data = {
      session: this.session,
      jobid: id,
      isFull: false
    }
    this.webSocketService.emit('previewSmall',JSON.stringify(data))
   
  }


  openBigPreview(id: number) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    this.loading = false;
    this.jobservice.loading = true
    this.jobservice.jobId = id;
    let data = {
      session: this.session,
      jobid: id,
      isFull: true
    }
    this.webSocketService.emit('preview',JSON.stringify(data))
    const dialogRef = this.dialog.open(JobPreviewComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  openProperties(id: number, baseId: number) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '95%'
    dialogConfig.width = '800px'
    dialogConfig.data = 
    {
      session: this.session,
      jobid: id,
      baseId: baseId
    }
    this.loading = false;
    this.jobservice.loading = true
    //this.jobservice.jobId = id;
    // let data = {
    //   session: this.session,
    //   jobid: id,
    //   isFull: true
    // }
    // this.webSocketService.emit('properties',JSON.stringify(data))
    const dialogRef = this.dialog.open(JobPropertiesComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }


  isRowsEqual(row: PeriodicElement) {
    return _.isEqual(this.clickedRow.values().next().value, row)
  }

  onRightClick(event: { preventDefault: () => void; }) {
    event.preventDefault();
  }

  isLoaded() {  
    this.loading = false
  }

  ngOnDestroy() {

  }

}

export interface PeriodicElement {
  id: number;
  jobname: string;
  size: number;
  pages: number;
  creted: string;
  printer: string;
  foldprogram: string;
  state: string;
  baseId: number;
}


