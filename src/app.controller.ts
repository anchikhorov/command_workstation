import { Controller, Get, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { Request } from 'express';

@Controller('jobs')
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) { }

  @Get()
  getJobs(@Req() request: Request, @Res({ passthrough: true }) response: Response): any {
    if (!request.cookies['session']) {
      return this.getInitialJobs(request,response)
    }
    if (request.cookies['session']) {
      return this.appService.getAllJobs(request.cookies['session'])
      .catch(err => {
        console.log(err)
        return this.getInitialJobs(request,response)
      })
        .then(jobs => {
          return jobs
        })
    }

  }

  getInitialJobs(@Req() request: Request, @Res({ passthrough: true }) response: Response){
    return this.appService.getSession()
        .then(session => this.appService.getAllJobs(session)
          .then(jobs => this.appService.setSessionTimeout(session)
          .then(() => this.appService.setPrinter(session)
          .then(() => this.appService.logon(session)
          .then(() =>{
            response.cookie('session', session)
            return jobs
          })))));
    
  }

}

