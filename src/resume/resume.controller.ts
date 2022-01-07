import { Controller,Get, Req } from '@nestjs/common';
import { AppService } from '../app.service';
import { Request } from 'express';
import { PreviewService } from 'src/preview/preview.service';

@Controller('resume')
export class ResumeController {
    constructor(
        private readonly appService: AppService,
        private readonly previewService: PreviewService
      ){}
    @Get()
    resumeJob(@Req() request: Request){
       const resumeJobPromise = async () => {
            //await this.appService.logon(request.cookies['session']);
         return this.previewService
         .loadJobFromSpooler(request.cookies['session'], request.query['id'])
         .then(()=> this.appService
         .resumeJob(request.cookies['session'], request.query['id']))
       }

       return resumeJobPromise()
    }
}
