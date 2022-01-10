import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Subscription } from 'rxjs';
import * as _ from "lodash";
import { Job } from './job.model';
import { JobsService } from './jobs.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CookieService } from 'ngx-cookie-service';
import { MatDialog } from '@angular/material/dialog';
import { JobPreviewComponent } from './job-preview/job-preview.component';
import { WebSocketService } from '../web-socket.service';


@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit, OnDestroy {
  //smallPreviewImages = new Map();
  jobs: Job[] = [];
  img: SafeUrl | null = null;
  //private jobsSub!: Subscription;
  //private previewSub!: Subscription;
  displayedColumns: string[] = ['id', 'jobname', 'user', 'size', 'pages', 'created', 'printer', 'foldprogram', 'state'];
  clickedRow = new Set<PeriodicElement>();
  loading = false
  isRowAndImageIdEqual = false
  session: string = ''
  deleted!: number

  constructor(
    private jobservice: JobsService,
    private sanitizer: DomSanitizer,
    private cookieService: CookieService,
    public dialog: MatDialog,
    private webSocketService: WebSocketService
  ) { }

  ngOnInit(): void {
    // this.jobsSub = this.jobservise.renderJobs().subscribe(jobs => {
    //   this.jobs = jobs
    // })
    this.webSocketService.listen('jobs').subscribe(data =>{
      //console.log(data)
      this.jobs = JSON.parse(String(data))
    })
    this.webSocketService.listen('session').subscribe(data =>{
      //console.log(data)
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
      //console.log("!this.loading && this.isRowAndImageIdEqual",!this.loading && this.isRowAndImageIdEqual)
      //this.jobservice.smallPreviewImages.delete(row.id)

    })

    this.webSocketService.listen('properties').subscribe(data =>{
      console.log(data)

    })
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
    // this.jobservise.resumeJob(row.id)
    //   .subscribe(() => console.log(`job ${row.id} was resumed`))
  }

  onContextMenuDelete(row: PeriodicElement) {

    let request = {
      session: this.session,
      jobid: row.id
    }
    this.webSocketService.emit('delete',JSON.stringify(request))
    this.jobservice.smallPreviewImages.delete(row.id)
    this.deleted = row.id
    // this.jobservise.deleteJob(row.id).subscribe(() => {
    //   this.clickedRow.clear();
    //   this.isIdEqual()
    //   this.img = null
    //   this.smallPreviewImages.delete(row.id)
    //   console.log(`job ${row.id} was deleted`)
    // })
  }


  onContextMenuPreview(row: PeriodicElement) {
    // if (this.jobservise.fullPreviewImages.get(row.id)) {
    //   this.img = this.sanitizer.bypassSecurityTrustUrl(this.jobservise.fullPreviewImages.get(row.id));
    //   this.loading = false
    //   //this.jobservise.loading = this.loading
    //   this.isRowAndImageIdEqual = true
    // } else {
    //   this.openBigPreview(row.id)
    // }
    this.openBigPreview(row.id)
     
  }

  onContextMenuProperties(row: PeriodicElement) {
    //alert(`Click on Action 2 for ${row.id}`);
    this.webSocketService.emit('properties',String(row.id))
  }

  onRowClick(row: PeriodicElement) {

    // if (this.previewSub) {
    //   this.previewSub.unsubscribe();
    // }
    if (!this.isRowsEqual(row)) {
      //console.log(this.isRowsEqual(row))
      this.clickedRow.clear();
      this.clickedRow.add(row)
      //this.isIdEqual()
      if (this.jobservice.smallPreviewImages.get(row.id) && (row.id != this.deleted)) {
        this.img = this.sanitizer.bypassSecurityTrustUrl(this.jobservice.smallPreviewImages.get(row.id));
        this.loading = false
        this.isRowAndImageIdEqual = true
      } else {
        this.getPreview(row.id)
      }
    }
  }

  getPreview(id: number) {
    this.loading = true
    //console.log('this.session', this.session)
    let data = {
      session: this.session,
      jobid: id,
      isFull: false
    }
    this.webSocketService.emit('previewSmall',JSON.stringify(data))
    // if (this.previewSub) {
    //   this.previewSub.unsubscribe()
    // }
    // this.jobservise.getPreview(id, false)
    // this.previewSub = this.jobservise.renderPreview().subscribe(
    //   {
    //     next: (value: any) => {
    //       const mediaType = 'image/png';
    //       const blob = new Blob([value], { type: mediaType });
    //       const unsafeImg = URL.createObjectURL(blob);
    //       this.img = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
    //       this.isIdEqual()
    //       this.loading = false
    //       const reader = new FileReader()
    //       reader.readAsDataURL(blob)
    //       reader.addEventListener('load', () => {
    //         this.smallPreviewImages.set(id, reader.result)
    //       })

    //     },
    //     error: (e: any) => console.error(e),
    //     complete: () => console.info('complete')
    //   }
    // );

  }


  openBigPreview(id: number) {
    this.loading = false;
    this.jobservice.loading = true
    this.jobservice.jobId = id;
    //console.log(this.jobservise.jobId);
    // if (this.previewSub) {
    //   this.previewSub.unsubscribe();
    // }
    //this.loading = true
    //console.log('this.session', this.session)
    let data = {
      session: this.session,
      jobid: id,
      isFull: true
    }
    this.webSocketService.emit('preview',JSON.stringify(data))
    // let isFullPreviewPresent: Boolean = this.cookieService
    //   .get('isFull') ? Boolean(JSON.parse(this.cookieService
    //     .get('isFull'))) : false
    const dialogRef = this.dialog.open(JobPreviewComponent);
    dialogRef.afterClosed().subscribe(result => {
      // !this.isRowAndImageIdEqual && !isFullPreviewPresent ? this.getPreview(id) : this.cookieService
      //   .set('isFull', String(isFullPreviewPresent))
      console.log(`Dialog result: ${result}`);
    });
  }

  // isIdEqual() {
  //   if (this.clickedRow.size == 1) {
  //     return this.isRowAndImageIdEqual = (this.clickedRow
  //       .values()
  //       .next()
  //       .value.id == parseInt(this.cookieService.get('id')))
  //   }
  //   return this.isRowAndImageIdEqual = false;
  // }

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
    //this.jobsSub.unsubscribe();
    //this.previewSub.unsubscribe();
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
}


