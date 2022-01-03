import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { JobsService } from '../jobs.service';

@Component({
  selector: 'app-job-preview',
  templateUrl: './job-preview.component.html',
  styleUrls: ['./job-preview.component.scss']
})
export class JobPreviewComponent implements OnInit {
  img : SafeUrl | null = null;
  //id!: number;
  private previewSub!: Subscription;
  loading = false
  constructor(
    private jobservise: JobsService,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
    //console.log(this.)
    this.getPreview(this.jobservise.jobId)
  }


  getPreview(id: number){
    this.loading = true
    this.img = null
    if(this.previewSub){
      this.previewSub.unsubscribe()
    }
    this.jobservise.getPreview(id)
    this.previewSub = this.jobservise.renderPreview().subscribe(
      {
        next: (value: any) => {
            const mediaType = 'image/png';
            const blob = new Blob([value], { type: mediaType });
            const unsafeImg = URL.createObjectURL(blob);
            this.img = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
            this.loading = false
            
        },
        error: (e: any) => console.error(e),
        complete: () => console.info('complete') 
      }
    );
  }

  ngOnDestroy(){
    if( this.previewSub){
      this.previewSub.unsubscribe();
    }
    this.jobservise.jobId = 0
  }
}
