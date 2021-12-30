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
  getInitialJobs(@Req() request: Request, @Res({ passthrough: true }) response: Response): any {
    if (!request.cookies['session']) {
      return this.appService.getSession()
        .then(session => this.appService.getAllJobs(session)
          .then(jobs => this.appService.setSessionTimeout(session)
          .then(() => this.appService.setPrinter(session)
          .then(() => {
            response.cookie('session', session)
            return jobs
          }))));
    }
    if (request.cookies['session']) {
      return this.appService.getAllJobs(request.cookies['session'])
        .then(jobs => {
          return jobs
        })
    }

  }

}

