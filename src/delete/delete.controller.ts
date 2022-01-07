import { Controller, Get, Req} from '@nestjs/common';
import { AppService } from '../app.service';
import { Request } from 'express';
import { PreviewService } from 'src/preview/preview.service';

@Controller('delete')
export class DeleteController {
    constructor(
        private readonly appService: AppService,
        private readonly previewService: PreviewService
      ){}
    @Get()
    deleteJob(@Req() request: Request){
       const deleteJobPromise = async () => {
         return await this.previewService
         .loadJobFromSpooler(request.cookies['session'], request.query['id'])
         .then(() => this.appService
         .deleteJob(request.cookies['session'], request.query['id']))
       }

       return deleteJobPromise()
    }

}
