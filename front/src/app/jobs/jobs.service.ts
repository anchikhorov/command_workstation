import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient} from "@angular/common/http";
import { Observable, timer, Subscription, Subject } from "rxjs";
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { Job } from "./job.model"
import * as moment from 'moment';

const BACKEND_URL: string = "http://localhost:3000/"

@Injectable({
  providedIn: 'root'
})
export class JobsService implements OnDestroy {
  private jobs: Job[] = []
  private jobsPublisher: Subject<Job[]> = new Subject<Job[]>();
  private previewPublisher = new Subject<any>();
  private alljobs$!: Subscription;
  private stopPolling = new Subject();

  constructor(private http: HttpClient) {

    this.alljobs$ = timer(0, 2000)
      .pipe(

        switchMap(async () => this.receiveJobs()),
        takeUntil(this.stopPolling)
      ).subscribe()
  }


  receiveJobs(): void {
    this.http.get<Job[]>(`${BACKEND_URL}jobs`, { withCredentials: true })
      .pipe(
        map(jobs => {
          return jobs.map(job => {
            job.created = moment(parseFloat(job.created) * 1000).format('DD.MM.YYYY, HH:mm:ss')
            job.size = parseFloat((job.size / 1048576).toFixed(2))
            return job
          })
        }))
      .subscribe(response => {
        this.jobsPublisher.next(response);
      });
  }

  renderJobs(): Observable<Job[]> {
    return this.jobsPublisher.asObservable();
  }

  getPreview(id: number) {
    //let url = "http://10.117.124.175/ScanInterface/print.getPrintPreview?id=oYFS2mSicj&w=200"
    this.http.get(
      `${BACKEND_URL}preview?id=${id}`,
      {
        responseType:"arraybuffer",
        withCredentials: true
      }
    )
      .subscribe(response => {
        //console.log(response)
        this.previewPublisher.next(response);
      });
  }

  renderPreview(): Observable<any> {
    return this.previewPublisher.asObservable();
  }

  
  deleteJob(id: number) {
    return this.http.get(
      `${BACKEND_URL}delete?id=${id}`,
      {
        withCredentials: true
      }
    )
  }

  ngOnDestroy() {
    this.stopPolling.next(null);
    this.alljobs$.unsubscribe()
  }
}
