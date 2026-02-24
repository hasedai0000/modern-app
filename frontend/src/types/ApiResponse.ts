export interface ResponseType<T = undefined> {
  status: number;
  data?: T;
  errorCode?: string;
  errorMessage?: string;
}

export type IErrorResponse = {
  status: number;
  statusText: string;
  headers: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  body: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  bodyUsed: boolean;
  ok: boolean;
  redirected: boolean;
  type: string;
  url: string;
};
