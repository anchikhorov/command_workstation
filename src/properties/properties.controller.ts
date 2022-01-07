import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from '../app.service';
import { Request} from 'express';

@Controller('properties')
export class PropertiesController {
    constructor(
        private readonly appService: AppService,
      ) { }
      @Get()
      setJobProperties(@Req() request: Request){
          return this.appService.setJobProperties(request.cookies['session'], request.query['id'])//rOKLXO33JI//2936
          .then(response => response)
      }
}
