import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription} from 'rxjs';
import { WebSocketService } from '../../web-socket.service';
import { JobsService } from '../jobs.service';

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
    private jobservise: JobsService,
    private sanitizer: DomSanitizer,
    private webSocketService: WebSocketService
  ) { }

  ngOnInit(): void {
    this.loading = this.jobservise.loading
    this.webSocketService.listen('preview').subscribe(response =>{
      let data = JSON.parse(String(response))
      this.img = this.sanitizer.bypassSecurityTrustUrl(data['dataUrl']);
      this.jobservise.loading = false
      this.loading = this.jobservise.loading
      //this.isRowAndImageIdEqual = true
      this.jobservise.fullPreviewImages.set(data['jobid'], data['dataUrl'])

    })
    //this.getPreview(this.jobservise.jobId)
  }


  // getPreview(id: number){
  //   this.loading = true
  //   this.img = null
  //   if(this.previewSub){
  //     this.previewSub.unsubscribe()
  //   }
  //   this.jobservise.getPreview(id,true)
  //   this.previewSub = this.jobservise.renderPreview().subscribe(
  //     {
  //       next: (value: any) => {
  //           const mediaType = 'image/png';
  //           const blob = new Blob([value], { type: mediaType });
  //           const unsafeImg = URL.createObjectURL(blob);
  //           this.img = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
            
  //       },
  //       error: (e: any) => console.error(e),
  //       complete: () => console.info('complete') 
  //     }
      
  //   );
  // }

  isLoaded(){
    this.loading = false
  }

  ngOnDestroy(){
    if( this.previewSub){
      this.previewSub.unsubscribe();
    }
    //this.jobservise.jobId = 0
    this.img = null
  }
}
