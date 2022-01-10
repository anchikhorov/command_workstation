import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient} from "@angular/common/http";
import { Observable, timer, Subscription, Subject } from "rxjs";
import { map, repeatWhen, switchMap, takeUntil } from 'rxjs/operators';
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
  private _stopPolling = new Subject<void>();
  private _startPolling = new Subject<void>();
  jobId!: number;

  constructor(private http: HttpClient) {

    // this.alljobs$ = timer(0, 3000)
    //   .pipe(
    //     switchMap(async () => this.receiveJobs()),
    //     takeUntil(this._stopPolling),
    //     repeatWhen(() => this._startPolling)
    //   ).subscribe()
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

  startPolling(): void {
    this._startPolling.next();
  }

  stopPolling(): void {
    this._stopPolling.next();
  }

  renderJobs(): Observable<Job[]> {
    return this.jobsPublisher.asObservable();
  }

  getPreview(id: number, isFull: boolean) {
    this.http.get(
      `${BACKEND_URL}preview?id=${id}&isFull=${isFull}`,
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

  resumeJob(id: number) {
    return this.http.get(
      `${BACKEND_URL}resume?id=${id}`,
      {
        withCredentials: true
      }
    )
  }

  ngOnDestroy() {
    this._stopPolling.next();
    this.alljobs$.unsubscribe()
  }
}
