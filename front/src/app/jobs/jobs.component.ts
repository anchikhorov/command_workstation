import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Subscription } from 'rxjs';
import * as _ from "lodash";
import { Job } from './job.model';
import { JobsService } from './jobs.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import {CookieService} from 'ngx-cookie-service';
import { MatDialog, MatDialogConfig, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { JobPreviewComponent } from './job-preview/job-preview.component';


@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit, OnDestroy {
  jobs: Job[] = []
  img : SafeUrl | null = null;
  //cookieValue!: number;
  private jobsSub!: Subscription;
  private previewSub!: Subscription;
  displayedColumns: string[] = ['id', 'jobname', 'user', 'size', 'pages', 'created', 'printer', 'foldprogram', 'state'];
  clickedRow = new Set<PeriodicElement>();
  loading = false
  isDeleted = true
  isRowAndImageIdEqual = false

  constructor(
    private jobservise: JobsService,
    private sanitizer: DomSanitizer,
    private cookieService: CookieService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
     this.jobsSub = this.jobservise.renderJobs().subscribe(jobs => {
      this.jobs = jobs
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

    this.jobservise.resumeJob(row.id)
    .subscribe(()=> console.log(`job ${row.id} was resumed`))
  }

  onContextMenuDelete(row: PeriodicElement) {
    this.jobservise.deleteJob(row.id).subscribe(()=> {
      this.clickedRow.clear();
      this.isIdEqual()
      this.img = null
      console.log(`job ${row.id} was deleted`)
    })
  }


  onContextMenuPreview(row: PeriodicElement) {
    this.openBigPreview(row.id)
  }

  onContextMenuAction2(row: PeriodicElement) {
    alert(`Click on Action 2 for ${row.id}`);
  }

  onRowClick(row: PeriodicElement) {
    
    if(this.previewSub){
      this.previewSub.unsubscribe();
    }
    if (!this.isRowsEqual(row)){
      console.log(this.isRowsEqual(row))
      this.clickedRow.clear();
      this.clickedRow.add(row)
      this.isIdEqual() 
      this.getPreview(row.id)
    }

  }

  getPreview(id: number){
    this.loading = true
    if(this.previewSub){
      this.previewSub.unsubscribe()
    }
    this.jobservise.getPreview(id, false)
    this.previewSub = this.jobservise.renderPreview().subscribe(
      {
        next: (value: any) => {
            const mediaType = 'image/png';
            const blob = new Blob([value], { type: mediaType });
            const unsafeImg = URL.createObjectURL(blob);
            this.img = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
            this.isIdEqual()
            this.loading = false  
        },
        error: (e: any) => console.error(e),
        complete: () => console.info('complete') 
      }
    );
  }

  openBigPreview(id: number) {
    this.loading = false;
    this.jobservise.jobId = id;
    console.log(this.jobservise.jobId);
    if(this.previewSub){
      this.previewSub.unsubscribe();
    }
    let isFullPreviewPresent: Boolean = this.cookieService.get('isFull') ? Boolean(JSON.parse(this.cookieService.get('isFull'))) : false
    //this.img = null
    const dialogRef = this.dialog.open(JobPreviewComponent);
    dialogRef.afterClosed().subscribe(result => {
      !this.isRowAndImageIdEqual && !isFullPreviewPresent ? this.getPreview(id) : this.cookieService.set('isFull',String(isFullPreviewPresent))
      console.log(`Dialog result: ${result}`);
    });
  }

  isIdEqual(){
    // console.log(this.clickedRow.size)
    console.log(this.clickedRow
       .values()
       .next()
       .value.id)
    console.log(parseInt(this.cookieService.get('id')))
    if(this.clickedRow.size == 1){
      return this.isRowAndImageIdEqual = (this.clickedRow
        .values()
        .next()
        .value.id == parseInt(this.cookieService.get('id'))) //&& !Boolean(JSON.parse(this.cookieService.get('isFull')))
    }
    return this.isRowAndImageIdEqual = false;
  }

  isRowsEqual(row: PeriodicElement){
    return _.isEqual(this.clickedRow.values().next().value, row)
  }

  onRightClick(event: { preventDefault: () => void; }) {
    event.preventDefault();
  }

  isLoaded(){
    this.loading = false
  }

  ngOnDestroy() {
    this.jobsSub.unsubscribe();
    this.previewSub.unsubscribe();
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

