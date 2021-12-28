import { HttpService } from '@nestjs/axios';
import { Injectable, Header, Req, StreamableFile } from '@nestjs/common';
import { Request} from 'express';
import { client } from 'davexmlrpc';
import { map } from 'rxjs/operators';
import { Subject, Observable,Subscription } from 'rxjs';
// import { Observable } from 'rxjs';
// import { Subscription } from 'rxjs';

@Injectable()
export class PreviewService {
    private urlEndpoint: string = "http://10.117.124.175/ScanInterface/";
    private format: string = "xml";
    private previewSubject = new Subject();
    //private previewSub!: Subscription;
    constructor(
        private readonly httpService: HttpService,
    ) { }

    loadJobFromSpooler(session, jobId): Promise<any> {
        let verb: string = "print.loadJobFromSpooler";
        let params: any = [session, parseInt(jobId)];

        const loadJobFromSpoolerPromise = () => {
            return new Promise((resolve, reject) => {
                client(this.urlEndpoint, verb, params, this.format, (err, data) => {
                    //   console.log(session)
                    //   console.log(typeof parseInt(jobId))
                    //   console.log(err)
                    if (err) {

                        return reject(err);
                    }
                    //   console.log(data)
                    resolve(data);
                });
            });
        }
        return loadJobFromSpoolerPromise()
    }

    @Header("Content-Type", "image/png")
    getPreview(@Req() request: Request){
        return this.httpService
            .get(`${this.urlEndpoint}print.getPrintPreview?id=${request.cookies['session']}&w=200`,
                {
                    responseType: "arraybuffer"
                })
            .pipe(
                map(response => {
                    //console.log(response.data)
                    return new StreamableFile(Buffer.from(response.data, 'binary'));
                })
            )

    }

    renderPreview(): Observable<any> {
        return this.previewSubject.asObservable();
      }
}
