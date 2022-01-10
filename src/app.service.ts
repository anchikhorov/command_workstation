import { Injectable, Header, Req, StreamableFile, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Request } from 'express';
import { client } from 'davexmlrpc';
import { Subject, timer } from 'rxjs';
import { map, switchMap, takeUntil, repeatWhen} from 'rxjs/operators';
import { Subscription, from } from 'rxjs';
import { AppGateway } from './app.gateway';

@Injectable()
export class AppService implements OnModuleDestroy {
  private urlEndpoint: string = "http://10.117.124.175/ScanInterface/";
  private format: string = "xml";
  private _stopPolling = new Subject<void>();
  private _startPolling = new Subject<void>();
  private alljobs$!: Subscription;

  constructor(
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => AppGateway)) private wsGateway: AppGateway,
    ) {

  }

  polling(session: string){
       this.alljobs$ = timer(0, 3000)
      .pipe(
        switchMap(async () => from(this.getAllJobs(session)).subscribe(
          {
          next: (jobs: any) => this.wsGateway.wss.emit('msgToClient', JSON.stringify(jobs)),
          error: (e: any) => console.error(e),
          complete: () => console.info('complete')
        })),
        takeUntil(this._stopPolling),
        repeatWhen(() => this._startPolling)
      )
      .subscribe()
  }

  startPolling(): void {
    this._startPolling.next();
  }
  stopPolling(): void {
    this._stopPolling.next();
  }

  async getSession(): Promise<any> {
    let verb: string = "open";
    let params: any = ["guest"];

    const getSessionPromise = () => {
      return new Promise((resolve, reject) => {
        client(this.urlEndpoint, verb, params, this.format, (err, data) => {
          if (err) {
            return reject(err);
          }

          resolve(data);
        });
      });
    }
    return getSessionPromise()
  }


  setSessionTimeout(session): Promise<any> {
    let verb: string = "setSessionTimeout";
    let params: any = [session, 1800];

    const setSessionTimeoutPromise = () => {
      return new Promise((resolve, reject) => {
        client(this.urlEndpoint, verb, params, this.format, (err, data) => {
          if (err) {
            return reject(err);
          }

          resolve(data);
        });
      });
    }
    return setSessionTimeoutPromise()
  }


  setPrinter(session: string): Promise<any> {
    let verb: string = "print.setParam";
    let params: any = [session, "printer", "ROWE"];

    const setPrinterPromise = () => {
      return new Promise((resolve, reject) => {
        client(this.urlEndpoint, verb, params, this.format, (err, data) => {
          if (err) {

            return reject(err);
          }
          resolve(data);
        });
      });
    }
    return setPrinterPromise()
  }


  getAllJobs(session: string): Promise<any> {
    let verb: string = "print_admin.getAllJobs";
    let params: any = [session, '', '', 10];

    const getAllJobsPromise = () => {
      return new Promise((resolve, reject) => {
        client(this.urlEndpoint, verb, params, this.format, (err, data) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    }
    return getAllJobsPromise()
  }

  deleteJob(session, jobId): Promise<any> {
    let verb: string = "print_admin.cancelJob";
    let params: any = [session, parseInt(jobId)];

    const deleteJobPromise = () => {
      return new Promise((resolve, reject) => {
        client(this.urlEndpoint, verb, params, this.format, (err, data) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    }
    return deleteJobPromise()
  }


  resumeJob(session, jobId): Promise<any> {
    let verb: string = "print_admin.resumeJob";
    let params: any = [session, parseInt(jobId)];

    const resumeJobPromise = () => {
      return new Promise((resolve, reject) => {
        client(this.urlEndpoint, verb, params, this.format, (err, data) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    }
    return resumeJobPromise()
  }


  logon(session): Promise<any> {
    let verb: string = "logon";
    let params: any = [session, 'joblistadmin', 'admin'];

    const logonPromise = () => {
      return new Promise((resolve, reject) => {
        client(this.urlEndpoint, verb, params, this.format, (err, data) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    }
    return logonPromise()
  }


  setJobProperties(session, jobId): Promise<any> {
    let verb: string = "call";
    let paramsArray = [
      ['scan.saveActiveSetFileOptions'],
      ['print.startSet', 0],
      ['print_admin.cancelJob', parseInt(jobId)]
    ];
    let params: any = [session, paramsArray];

    const setJobPropertiesPromise = () => {
      return new Promise((resolve, reject) => {
        client(this.urlEndpoint, verb, params, this.format, (err, data) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    }
    return setJobPropertiesPromise()
  }

  loadJobFromSpooler(session, jobId): Promise<any> {
    let verb: string = "print.loadJobFromSpooler";
    let params: any = [session, parseInt(jobId)];

    const loadJobFromSpoolerPromise = () => {
      return new Promise((resolve, reject) => {
        client(this.urlEndpoint, verb, params, this.format, (err, data) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    }
    return loadJobFromSpoolerPromise()
  }

  @Header("Content-Type", "image/png")
  getPreview(@Req() request: Request) {
    let size = request.query['isFull'] ? '&w=520' : '&w=200';
    return this.httpService
      .get(`${this.urlEndpoint}print.getPrintPreview?id=${request.cookies['session']}${size}`,
        {
          responseType: "arraybuffer"
        })
      .pipe(
        map(response => {
          return new StreamableFile(Buffer.from(response.data, 'binary'));
        })
      )

  }

  onModuleDestroy() {
    this.stopPolling()
  }


}



