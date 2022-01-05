import { Controller, Get, Req, Res} from '@nestjs/common';
import { Request, Response } from 'express';
import { PreviewService } from './preview.service';



@Controller('preview')
export class PreviewController {
    constructor(
        private readonly previewService: PreviewService,
    ) { }
    @Get()
    getPreview(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        response.cookie('id', request.query['id']);
        response.cookie('isFull',request.query['isFull']);
        const getPreviewPromise = async () => {
            await this.previewService
                .loadJobFromSpooler(request.cookies['session'], request.query['id']);
            return this.previewService.getPreview(request);
        }
        return getPreviewPromise()
    }

}
