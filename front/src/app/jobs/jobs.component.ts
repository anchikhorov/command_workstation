import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Subscription } from 'rxjs';
import * as _ from "lodash";
import { Job } from './job.model';
import { JobsService } from './jobs.service';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit, OnDestroy {
  jobs: Job[] = []
  private jobsSub!: Subscription;
  displayedColumns: string[] = ['id', 'jobname', 'user', 'size', 'pages', 'created', 'printer', 'foldprogram', 'state'];
  clickedRow = new Set<PeriodicElement>();

  constructor(
    private jobservise: JobsService,
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

  onContextMenuAction1(row: PeriodicElement) {
    alert(`Click on Action 1 for ${row.id}`);
  }

  onContextMenuAction2(row: PeriodicElement) {
    alert(`Click on Action 2 for ${row.id}`);
  }

  onRowClick(row: PeriodicElement) {
    this.clickedRow.clear();
    this.clickedRow.add(row) 
  }

  isEqual(row: PeriodicElement){
    return _.isEqual(this.clickedRow.values().next().value, row)
  }

  onRightClick(event: { preventDefault: () => void; }) {
    event.preventDefault();
  }

  ngOnDestroy() {
    this.jobsSub.unsubscribe();
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
