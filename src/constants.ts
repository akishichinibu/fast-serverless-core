export const FAST_METAKEY_PREFIX = 'fast';

export const ENDPOINT_MARK = `__endpoint__`;
export const HANDLER_MARK = `__handler__`;

export enum HandlerParamsMetaKeyEnum {
  Path = 'path',
  Query = 'query',
  Body = 'body'
}

export type HandlerParamsMetaKeyType = `${HandlerParamsMetaKeyEnum}`;

export const HANDLER_PARAMS_METADATA_PREFIX = `args`;

export enum HttpMethodEnum {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE'
}

export { StatusCodes as HttpStatusCodes } from 'http-status-codes';

export const ENDPOINT_FILE_EXT = '.controller.ts';
