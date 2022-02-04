import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription} from 'rxjs';
import { WebSocketService } from '../../web-socket.service';
//import { JobsService } from '../jobs.service';

@Component({
  selector: 'app-job-preview',
  templateUrl: './job-preview.component.html',
  styleUrls: ['./job-preview.component.scss']
})
export class JobPreviewComponent implements OnInit {
  img : SafeUrl | null = null;
  private previewSub!: Subscription;
  loading = false
  constructor(
    //private jobservise: JobsService,
    private sanitizer: DomSanitizer,
    private webSocketService: WebSocketService
  ) { }

  ngOnInit(): void {
    this.loading = true
    this.webSocketService.listen('preview').subscribe(response =>{
      let data = JSON.parse(String(response))
      this.img = this.sanitizer.bypassSecurityTrustUrl(data['dataUrl']);
      this.loading = false

    })
    
  }



  isLoaded(){
    this.loading = false
  }

  ngOnDestroy(){
    if( this.previewSub){
      this.previewSub.unsubscribe();
    }
    
    this.img = null
  }
}
