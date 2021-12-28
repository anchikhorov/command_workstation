import { HttpService } from '@nestjs/axios';
import { Controller, Get, Req} from '@nestjs/common';
import { Request } from 'express';
import { PreviewService } from './preview.service';



@Controller('preview')
export class PreviewController {
    private urlEndpoint: string = "http://10.117.124.175/ScanInterface/";
    // private previewSubject = new Subject();
    // private previewSub!: Subscription;
    constructor(
        private readonly httpService: HttpService,
        private readonly previewService: PreviewService,
    ) { }
    @Get()
    getPreview(@Req() request: Request) {
        const getPreviewPromise = () => {
            return this.previewService
                .loadJobFromSpooler(request.cookies['session'], request.query['id'])
                .then(() => {
                    return this.previewService.getPreview(request)
                })
        }
        return getPreviewPromise()
    }

}
