import { HttpMethodEnum } from './constants';

export type ClzType<R> = { new (...args: any[]): R };

export type ClzerType = (...params: any[]) => ClzType<any>;

export type Nullable<T> = T | null;

export type IRequestHandler = (...args: any[]) => Promise<any>;

export type IExceptionHandler = (error: any) => null;

export type RequestHandlerDescriptor = TypedPropertyDescriptor<IRequestHandler>;

export type HttpMethod = `${HttpMethodEnum}`;
