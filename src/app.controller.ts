import { Controller, Get, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) { }

  @Get('session')
  async getSession(): Promise<string>{
    return await this.appService.getSession()
    .then(session => session)
  }

  @Get('jobs')
  async getJobs(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<any> {
    if (!request.cookies['session']) {
      return await this.getInitialJobs(request,response)
    }
    if (request.cookies['session']) {
      return await this.appService.getAllJobs(request.cookies['session'])
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

  @Get('resume')
  async resumeJob(@Req() request: Request): Promise<any>{
    return await this.appService
    .resumeJob(request.cookies['session'], request.query['id'])
  }


  @Get('preview')
  async getPreview(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<any> {
      response.cookie('id', request.query['id']);
      response.cookie('isFull',request.query['isFull']);
      const getPreviewPromise = async () => {
          await this.appService
              .loadJobFromSpooler(request.cookies['session'], request.query['id']);
          return this.appService.getPreview(request);
      }
      return getPreviewPromise()
  }

  @Get('delete')
  async deleteJob(@Req() request: Request): Promise<any> {
    const deleteJobPromise = async () => {
      return await this.appService
      .deleteJob(request.cookies['session'], request.query['id'])
    }

    return deleteJobPromise()
 }


 @Get('properties')
 async setJobProperties(@Req() request: Request): Promise<any>{
     return await this.appService
     .setJobProperties(request.cookies['session'], request.query['id'])
     .then(response => response)
 }

}

