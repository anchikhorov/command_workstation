import { Injectable } from '@nestjs/common';
import { client } from 'davexmlrpc';

@Injectable()
export class AppService {
  private urlEndpoint: string = "http://10.117.124.175/ScanInterface/";
  private format: string = "xml";

  getSession(): Promise<any> {
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
    let params: any = [session,1800];

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


  setPrinter(session): Promise<any> {
    let verb: string = "print.setParam";
    let params: any = [session,"printer","ROWE"];

    const setPrinterPromise = () => {
      return new Promise((resolve, reject) => {
        client(this.urlEndpoint, verb, params, this.format, (err, data) => {
          // console.log(session)
          // console.log(err)
          if (err) {
          
            return reject(err);
          }
          // console.log(data)
          resolve(data);
        });
      });
    }
    return setPrinterPromise()
  }


  getAllJobs(session): Promise<any> {
    let verb: string = "print_admin.getAllJobs";
    let params: any = [session];

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

}

