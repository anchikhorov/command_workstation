import { Injectable, Header, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { client } from 'davexmlrpc';
import { Subject, timer } from 'rxjs';
import { map, switchMap, takeUntil, repeatWhen } from 'rxjs/operators';
import { Subscription, from } from 'rxjs';
import { AppGateway } from './app.gateway';
import * as moment from 'moment';
import * as fs from 'fs';
import { writeFile } from 'fs/promises';
import * as path from 'path';

@Injectable()
export class AppService implements OnModuleDestroy {
  //private urlEndpoint: string = "http://10.117.124.41/ScanInterface/";
  private urlEndpoint: string = "http://192.168.182.128/ScanInterface/";
  private format: string = "xml";
  private _stopPolling = new Subject<void>();
  private _startPolling = new Subject<void>();
  alljobs$?: Subscription;
  count = 0
  picturesPath = path.join(__dirname, '..', 'pictures');


  constructor(
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => AppGateway)) private wsGateway: AppGateway,
  ) { }

  xmlrpcRequest(method: string, params?: any[]): Promise<any> {
    const xmlrpcRequestPromise = () => {
      return new Promise((resolve, reject) => {
        client(this.urlEndpoint, method, params, this.format, (err, data) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    }
    return xmlrpcRequestPromise()
  }


  polling(session: string) {
    this.count = 0
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
              return job
            })
          })
        )
          .subscribe(
            {
              next: (jobs: any) => {
                try {
                  Promise.all(jobs)
                    .catch(err => {
                      return
                    })
                    .then((jobs: any[]) => {
                      let sortedjobs: any[]
                      try {
                        if (jobs.length == 0) {
                          this.count = 0
                        }
                        if (jobs.length > 0) {
                          sortedjobs = jobs.sort(this.sortWithBaseId)
                          this.getPreviews(session, sortedjobs, this.picturesPath)
                        }
                        this.wsGateway.wss.emit('jobs', JSON.stringify(sortedjobs))
                      }
                      catch {
                        console.log('no jobs')
                      }

                    })
                }
                catch {
                  console.log("catch worked")
                }

              },
              error: (e: any) => console.error(e),
              complete: () => null
            })),
        takeUntil(this._stopPolling),
        repeatWhen(() => this._startPolling)
      )
      .subscribe()
  }

  sortWithBaseId(a: any, b: any) {
    if (a.baseId && !b.baseId) {
      if (a.baseId > b.id) {
        return 1
      }

      if (a.baseId < b.id) {
        return -1
      }

    }
    if (!a.baseId && b.baseId) {
      if (a.id > b.baseId) {
        return 1
      }

      if (a.id < b.baseId) {
        return -1
      }
    }

    if (a.baseId && b.baseId) {
      if (a.baseId > b.baseId) {
        return 1
      }

      if (a.baseId < b.baseId) {
        return -1
      }
    }

    if (!a.baseId && !b.baseId) {
      if (a.id > b.id) {
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
  getPreview(request: any) {
    console.log('getPriview', request)
    let size = request['isFull'] ? '&w=520' : '&w=200';
    return this.httpService

      //.get(`${this.urlEndpoint}print.getPrintPreview?id=${request['session']}${size}`,
      /// from this
      .get(this.urlEndpoint +
        'image.getFilteredData?id=' +
        request['session'] +
        '&x=0&y=0&w=0&h=0&w_out=600&highquality=0&set_filters_from_printparams=0&index=' +
        request['jobid'] +
        (new Date().getTime()),
        /// to this
        {
          responseType: "arraybuffer",
        })
      .pipe(
        map(response => {
          return response.data
        })
      )

  }

  getPreviews = (session, jobs, path) => {
    console.log('this.count', this.count)
    try {
      if (!fs.existsSync(path)) {
        fs.mkdir(path, { recursive: false }, (err) => {
          if (err) throw err;
        });
      }
      fs.readdir(path, async (err, files) => {
        for (let i = 0; i < jobs.length; i++) {
          if (!files.includes(String(jobs[i]['id']))) {
            this.count = i
            break
          } else {
            this.count = 0
          }

        }
        if (!files.includes(String(jobs[this.count]['id']))) {
          if (this.count < jobs.length) {

            await this.xmlrpcRequest('call', [session, [['print.loadJobFromSpooler', jobs[this.count]['id']],]])
              .catch(err => console.log(err))
              .then(() => {
                this.getPreview({
                  session: session,
                  jobid: jobs[this.count]['id'],
                  isFull: false
                }).subscribe((arrayBuffer) => {

                  const controller = new AbortController();
                  const { signal } = controller;
                  //writeFile(`${path}\\${jobs[this.count]['id']}`, Buffer.from(arrayBuffer), { signal });
                  fs.writeFileSync(`${path}\\${jobs[this.count]['id']}`, Buffer.from(arrayBuffer))
                  this.count++
                  this.getPreviews(session, jobs, path)
                })

              })

          }

        }

      })

    }
    catch {
      console.log('catch', this.count)
      console.log('previews catch')
      this.count = 0
    }

  }

  deletePreview(id: number) {
    if (fs.existsSync(`${this.picturesPath}/${id}`)) {
      fs.unlink(`${this.picturesPath}/${id}`, (err) => {
        if (err) throw err;
        console.log(`${this.picturesPath}/${id} was deleted`);
      });
    }

  }



  onModuleDestroy() {
    this.stopPolling()
  }


}



