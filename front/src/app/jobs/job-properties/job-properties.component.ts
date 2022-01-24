import { Component, Inject, OnInit } from '@angular/core';
//import {Component, Inject} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../web-socket.service';
import { JobsService } from '../jobs.service';

@Component({
  selector: 'app-job-properties',
  templateUrl: './job-properties.component.html',
  styleUrls: ['./job-properties.component.scss']
})
export class JobPropertiesComponent implements OnInit {
  properties: any[] = []
  private previewSub!: Subscription;

  loading = false
  choices = [
    { value: true },
    { value: false },
  ]

  // rotation = [
  //   { value: "Auto" },
  //   { value: "0" },
  //   { value: "90" },
  //   { value: "180" },
  //   { value: "270" },
  // ]

  colormodes = [
    { value: "line" },
    { value: "foto" },
    { value: "mixed" },
  ]

  constructor(
    private jobservise: JobsService,
    private sanitizer: DomSanitizer,
    private webSocketService: WebSocketService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.loading = true
    this.webSocketService.emit('properties', JSON.stringify(this.data))
    this.webSocketService.listen('properties').subscribe((response) =>{
      this.properties = JSON.parse(String(response))
      this.loading = false
      console.log(this.properties)

    })
  }

}
