import { Controller, Get, Req} from '@nestjs/common';
import { AppService } from '../app.service';
import { Request } from 'express';

@Controller('delete')
export class DeleteController {
    constructor(
        private readonly appService: AppService,
      ){}
    @Get()
    deleteJob(@Req() request: Request){
      // console.log("preview request.query['session']", request.cookies['session'])
      // console.log("preview request.query['id']", request.query['id'])
       const deleteJobPromise = async () => {
            await this.appService.logon(request.cookies['session']);
         return await this.appService.deleteJob(request.cookies['session'], request.query['id']);
       }

       return deleteJobPromise()
    }

}
