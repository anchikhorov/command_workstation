import { Injectable } from '@nestjs/common';
import { client } from 'davexmlrpc';

@Injectable()
export class AppService {
  private urlEndpoint: string = "http://10.117.124.175/ScanInterface/";
  private format: string = "xml";

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
    let params: any = [session,'','',10];

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
    let params: any = [session, 'joblistadmin','admin'];

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
      ['print_admin.cancelJob',parseInt(jobId)]
    ];
    let params: any = [session,paramsArray];

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


}



