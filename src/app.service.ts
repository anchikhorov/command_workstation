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

