import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import * as _ from 'lodash';
import { Job } from './job.model';
import { SafeUrl } from '@angular/platform-browser';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { JobPreviewComponent } from './job-preview/job-preview.component';
import { JobPropertiesComponent } from './job-properties/job-properties.component';
import { WebSocketService } from '../web-socket.service';

const BACKEND_URL = 'api/';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss'],
})
export class JobsComponent implements OnInit {
  jobs: Job[] = [];
  img: SafeUrl | null = null;
  displayedColumns: string[] = [
    'baseId',
    'jobname',
    'user',
    'size',
    'pages',
    'created',
    'printer',
    'foldprogram',
    'state',
  ];
  clickedRow = new Set<PeriodicElement>();
  loading = false;
  isRowAndImageIdEqual = false;
  session = '';
  deleted!: number;
  properties: any[] = [];
  timeOut!: any;

  constructor(
    public dialog: MatDialog,
    private webSocketService: WebSocketService,
  ) {}

  ngOnInit(): void {
    this.webSocketService.listen('jobs').subscribe((data) => {
      this.jobs = JSON.parse(String(data));
    });
    this.webSocketService.listen('session').subscribe((data) => {
      this.session = String(data);
      console.log(this.session);
    });

    this.webSocketService.listen('resume').subscribe((data) => {
      console.log(data);
    });

    this.webSocketService.listen('delete').subscribe((data) => {
      this.clickedRow.clear();
      this.isRowAndImageIdEqual = false;
      this.img = null;
      this.loading = false;
    });
  }

  @ViewChild('trigger') contextMenu!: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };

  @ViewChild('trigger1') contextMenu1!: MatMenuTrigger;

  onContextMenu(event: MouseEvent, row: PeriodicElement) {
    if (row.state != 'DELETING') {
      this.onRowClick(row);
      event.preventDefault();
      this.contextMenuPosition.x = event.clientX + 'px';
      this.contextMenuPosition.y = event.clientY + 'px';
      this.contextMenu.menuData = { row: row };
      this.contextMenu.menu.focusFirstItem('mouse');
      this.contextMenu.openMenu();
    }
  }

  onContextMenu1(event: MouseEvent) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu1.menu.focusFirstItem('mouse');
    this.contextMenu1.openMenu();
  }

  onContextMenuResume(row: PeriodicElement | null) {
    const request = {
      session: this.session,
      jobid: row ? row.id : null,
    };
    this.webSocketService.emit('resume', JSON.stringify(request));
  }

  onContextMenuDelete(row: PeriodicElement | null) {
    row
      ? (row.state = 'DELETING')
      : this.jobs.forEach((job) => {
          job.state = 'DELETING';
        });
    const request = {
      session: this.session,
      jobid: row ? row.id : null,
    };
    this.webSocketService.emit('delete', JSON.stringify(request));
  }

  onContextMenuHold(row: PeriodicElement | null) {
    const request = {
      session: this.session,
      jobid: row ? row.id : null,
    };
    this.webSocketService.emit('hold', JSON.stringify(request));
  }

  onContextMenuPreview(row: PeriodicElement) {
    this.openBigPreview(row.id);
  }

  onContextMenuProperties(row: PeriodicElement) {
    this.openProperties(row.id, row.baseId);
  }

  onRowClick(row: PeriodicElement) {
    if (!this.isRowsEqual(row) && row.state != 'DELETING') {
      this.clickedRow.clear();
      this.clickedRow.add(row);
      this.getPreview(row.id);
    }
  }

  getPreview(id: number) {
    if (this.timeOut) {
      clearTimeout(this.timeOut);
    }
    this.img = `${BACKEND_URL}pictures/${id}`;
  }

  openBigPreview(id: number) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    this.loading = false;
    const data = {
      session: this.session,
      jobid: id,
      isFull: true,
    };
    this.webSocketService.emit('preview', JSON.stringify(data));
    const dialogRef = this.dialog.open(JobPreviewComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  openProperties(id: number, baseId: number) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '95%';
    dialogConfig.width = '800px';
    dialogConfig.data = {
      session: this.session,
      jobid: id,
      baseId: baseId,
    };
    this.loading = false;
    const dialogRef = this.dialog.open(JobPropertiesComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  isRowsEqual(row: PeriodicElement) {
    return _.isEqual(this.clickedRow.values().next().value, row);
  }

  onRightClick(event: { preventDefault: () => void }) {
    event.preventDefault();
  }

  isLoaded() {
    console.log('isLoading worked');
    this.loading = false;
  }

  waitAndReload(img: SafeUrl | null, event: any) {
    const originalSrc = img;
    console.log('waitAndReload works');

    if (
      parseInt(event.target.getAttribute('data-retry'), 10) !==
      parseInt(event.target.getAttribute('data-max-retry'), 10)
    ) {
      event.target.setAttribute(
        'data-retry',
        parseInt(event.target.getAttribute('data-retry'), 10) + 1,
      );

      event.target.src = '/assets/images/placeholder.png';

      this.timeOut = setTimeout(() => {
        event.target.src = originalSrc;
      }, 5000);
    } else {
      event.target.src = '/assets/images/placeholder.png';
    }
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
