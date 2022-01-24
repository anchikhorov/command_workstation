import { Injectable, Header, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { client } from 'davexmlrpc';
import { Subject, timer } from 'rxjs';
import { map, switchMap, takeUntil, repeatWhen } from 'rxjs/operators';
import { Subscription, from } from 'rxjs';
import { AppGateway } from './app.gateway';
import bufferToDataUrl from "buffer-to-data-url"
import * as moment from 'moment';

@Injectable()
export class AppService implements OnModuleDestroy {
  private urlEndpoint: string = "http://10.117.124.175/ScanInterface/";
  //private urlEndpoint: string = "http://192.168.182.128/ScanInterface/";
  private format: string = "xml";
  private _stopPolling = new Subject<void>();
  private _startPolling = new Subject<void>();
  alljobs$?: Subscription;


  constructor(
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => AppGateway)) private wsGateway: AppGateway,
  ) { }

  xmlrpcRequest(method: string, params?: any[]): Promise<any> {
    const getAllJobsPromise = () => {
      return new Promise((resolve, reject) => {
        client(this.urlEndpoint, method, params, this.format, (err, data) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    }
    return getAllJobsPromise()
  }


  polling(session: string) {
    this.alljobs$ = timer(0, 10000)
      .pipe(
        switchMap(async () => from(this.xmlrpcRequest("print_admin.getAllJobs", [session, '', '', 10])
          .catch((err) => {
            console.log(err)
            this.stopPolling()
          })
        ).pipe(
          map(jobs => {
            return jobs.map(async (job: any) => {
              await this.xmlrpcRequest('call', [session, [['print.loadJobFromSpooler', job.id], ["print.getParam", "jobinfo1"]]])
                .catch(err => {
                  console.log(err)
                  return
                })
                .then((data) => {
                    job.baseId = parseInt(data[1].value)
                })
                .finally(() => {
                  job.created = moment(parseFloat(job.created) * 1000).format('DD.MM.YYYY, HH:mm:ss')
                  job.size = parseFloat((job.size / 1048576).toFixed(2))
                  return job
                })

              //job.created = moment(parseFloat(job.created) * 1000).format('DD.MM.YYYY, HH:mm:ss')
              //job.size = parseFloat((job.size / 1048576).toFixed(2))
              //console.log(job)
              return job
            })
          })
        )
          .subscribe(
            {
              next: (jobs: any) => {
                //console.log(jobs)
                try{
                  Promise.all(jobs)
                  .catch(err => {
                    //console.log(err)
                    return})
                  .then((jobs: any[]) => {
                    let sortedjobs: any[]
                    if(jobs){
                      sortedjobs = jobs.sort(this.sortWithBaseId)
                      this.wsGateway.wss.emit('jobs', JSON.stringify(sortedjobs))
                    }

                  })
                }
                catch{
                   console.log("catch worked")
                }

                //this.wsGateway.wss.emit('jobs', JSON.stringify(jobs))
              },
              error: (e: any) => console.error(e),
              complete: () => null//console.info('Job send complete.')
            })),
        takeUntil(this._stopPolling),
        repeatWhen(() => this._startPolling)
      )
      .subscribe()
  }

  sortWithBaseId(a: any, b: any){
      if(a.baseId && !b.baseId){
        if(a.baseId > b.id){
          return 1
        }

        if (a.baseId < b.id) {
          return -1
        }

      }
      if ( !a.baseId && b.baseId) { 
        if(a.id > b.baseId){
          return 1
        }

        if (a.id < b.baseId) {
          return -1
        }
      }

      if (a.baseId && b.baseId ) {
        if(a.baseId > b.baseId){
          return 1
        }

        if (a.baseId < b.baseId) {
          return -1
        }
      }

      if (!a.baseId && !b.baseId ) {
        if(a.id > b.id){
          return 1
        }

        if (a.id < b.id) {
          return -1
        }
      }
      
        return 0

  }

  startPolling(): void {
    this._startPolling.next();
  }
  stopPolling(): void {
    this._stopPolling.next();
  }

  @Header("Content-Type", "image/png")
  //getPreview(@Req() request: Request) {
  getPreview(request: any) {
    console.log('getPriview', request)
    let size = request['isFull'] ? '&w=520' : '&w=200';
    return this.httpService
      .get(`${this.urlEndpoint}print.getPrintPreview?id=${request['session']}${size}`,
      // .get(this.urlEndpoint +
      //   'image.getFilteredData?id=' +
      //   request['session'] +
      //   '&x=0&y=0&w=0&h=0&w_out=600&highquality=0&set_filters_from_printparams=0&index=' +
      //   request['jobid'] +
      //   (new Date().getTime()),
        {
          responseType: "arraybuffer",
        })
      .pipe(
        map(response => {
          let data = {
            jobid: null,
            dataUrl: null
          }
          data['jobid'] = request['jobid'],
            data['dataUrl'] = bufferToDataUrl("image/png", Buffer.from(response.data))
          return data

        })
      )

  }

  onModuleDestroy() {
    this.stopPolling()
  }


}



