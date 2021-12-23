import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable, timer, Subscription, Subject } from "rxjs";
import { map, switchMap,takeUntil} from 'rxjs/operators';
import { Job } from "./job.model"
import * as moment from 'moment';

const BACKEND_URL: string = "http://localhost:3000/jobs"

@Injectable({
  providedIn: 'root'
})
export class JobsService implements OnDestroy{
  private jobs: Job[] = []
  private jobsPublisher: Subject<Job[]> = new Subject<Job[]>();
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
    this.http.get<Job[]>(BACKEND_URL, {withCredentials: true})
    .pipe(
      map(jobs => {
        return jobs.map(job => {
          job.created = moment(parseFloat(job.created) * 1000).format('DD.MM.YYYY, HH:mm:ss')
          job.size = parseFloat((job.size / 1048576).toFixed(2))
          return job})}))
      .subscribe(response => {
        this.jobsPublisher.next(response);
      });
  }

  renderJobs(): Observable<Job[]> {
    return this.jobsPublisher.asObservable();
  }

  ngOnDestroy() {
    this.stopPolling.next(null);
    this.alljobs$.unsubscribe()
  }
}
