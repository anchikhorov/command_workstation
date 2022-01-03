import { Controller,Get, Req } from '@nestjs/common';
import { AppService } from '../app.service';
import { Request } from 'express';

@Controller('resume')
export class ResumeController {
    constructor(
        private readonly appService: AppService,
      ){}
    @Get()
    resumeJob(@Req() request: Request){
      // console.log("preview request.query['session']", request.cookies['session'])
      // console.log("preview request.query['id']", request.query['id'])
       const resumeJobPromise = async () => {
            await this.appService.logon(request.cookies['session']);
         return await this.appService.resumeJob(request.cookies['session'], request.query['id']);
       }

       return resumeJobPromise()
    }
}
