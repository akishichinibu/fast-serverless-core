export { StatusCodes as HttpStatusCodes } from 'http-status-codes';

export enum HttpMethodEnum {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete'
}

export type HttpMethod = `${HttpMethodEnum}`;
