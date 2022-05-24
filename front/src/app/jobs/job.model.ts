export interface Job {
  last_state: string;
  state_info: string;
  printer: string;
  user_id: string;
  created: string;
  hostname: string;
  finished: number;
  pages_printed: number;
  jobname: string;
  priority: string;
  foldprogram: string;
  follow_me_pin_active: boolean;
  state: string;
  user: string;
  client_id: string;
  id: number;
  joblist_uri: string;
  outputbin: string;
  pages: number;
  size: number;
}
