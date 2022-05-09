import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
//import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
//import { Subscription } from 'rxjs';
import { WebSocketService } from '../../web-socket.service';
//import { JobsService } from '../jobs.service';
import { FormGroup, FormControl, Validators } from "@angular/forms";

@Component({
  selector: 'app-job-properties',
  templateUrl: './job-properties.component.html',
  styleUrls: ['./job-properties.component.scss']
})
export class JobPropertiesComponent implements OnInit {
  properties: any[] = [
    {
      colormode: {
        value: false,
        values: [true, false]
      },
      auto_cropping: {
        value: false,
        values: [true, false]
      },
      copies_file: {
        value: 1,
        min: 1,
        max: 999
      },
      medium: {
        value: '',
        values: []
      },
      mediasource: {
        value: '',
        values: []
      },
      rotation: {
        value: '',
        values: []
      },
      rotate_to_orientation: {
        value: '',
        values: []
      },
      roll_placement: {
        value: '',
        values: []
      },
      stampoption: {
        value: '',
        values: []
      }
    }
  ]
  form!: FormGroup;
  loading = false


  constructor(
    private webSocketService: WebSocketService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.loading = true
    this.form = new FormGroup({
      colormode: new FormControl(null, { validators: [] }),
      copies_file: new FormControl(null, { validators: [] }),
      medium: new FormControl(null, { validators: [] }),
      mediasource: new FormControl(null, { validators: [] }),
      auto_cropping: new FormControl(null, { validators: [] }),
      rotation: new FormControl(null, { validators: [] }),
      rotate_to_orientation: new FormControl(null, { validators: [] }),
      roll_placement: new FormControl(null, { validators: [] }),
      stampoption: new FormControl(null, { validators: [] }),
    });


    
    this.webSocketService.emit('getProperties', JSON.stringify(this.data))
    this.webSocketService.listen('getProperties').subscribe((response) => {
      let properties = JSON.parse(String(response))
      console.log(this.properties)
      this.properties[0]['colormode'].value = properties[2].value
      this.properties[0]['copies_file'].value = properties[1]['copies_file'].value
      this.properties[0]['medium'].value = properties[1]['medium'].value
      this.properties[0]['mediasource'].value = properties[1]['mediasource'].value
      this.properties[0]['auto_cropping'].value = properties[1]['auto_cropping'].value
      this.properties[0]['rotation'].value = properties[1]['rotation'].value
      this.properties[0]['rotate_to_orientation'].value = properties[1]['rotate_to_orientation'].value
      this.properties[0]['roll_placement'].value = properties[1]['roll_placement'].value
      this.properties[0]['stampoption'].value = properties[1]['stampoption'].value
      
      
      this.form.setValue({
        colormode: this.properties[0]['colormode'].value,//{ value: this.properties[2].value, disabled: this.properties[2].value},
        copies_file: this.properties[0]['copies_file'].value,
        medium: this.properties[0]['medium'].value,
        mediasource: this.properties[0]['mediasource'].value,
        auto_cropping: this.properties[0]['auto_cropping'].value,
        rotation: this.properties[0]['rotation'].value,
        rotate_to_orientation: this.properties[0]['rotate_to_orientation'].value,
        roll_placement: this.properties[0]['roll_placement'].value,
        stampoption: this.properties[0]['stampoption'].value,
      })
      if (!this.form.value.colormode){
        //console.log(this.form)
        this.form.controls['colormode'].disable()
      }
      this.loading = false

    })
  }

  onSubmit() {
    let request = this.form.value
    request.session = this.data.session
    request.jobid = this.data.jobid
    request.baseId = this.data.baseId
    this.webSocketService.emit('setProperties', JSON.stringify(request))
    //console.log(this.form.value)
  }

}
