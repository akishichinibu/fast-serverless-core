import 'reflect-metadata';
import * as c from './constants';
import { HandlerParamsType } from './constants';
import { ClzType, RequestHandlerDescriptor } from './type';

export const defineMetadatas = (target: any, propertyKey?: string | symbol) => {
  return (data: { [key: string]: any }) => {
    Object.entries(data).forEach(([k, v]) =>
      propertyKey === undefined ? Reflect.defineMetadata(k, v, target) : Reflect.defineMetadata(k, v, target, propertyKey)
    );
  };
};

export function getMetadataDefaultOrThrow<T>(target: any, key: string, default_?: T) {
  const r = Reflect.getMetadata(key, target);

  if (r === undefined) {
    if (default_ !== undefined) {
      return default_;
    } else {
      throw new Error(`Try to get metadata [${key}] from [${target}] but failed. `);
    }
  } else {
    return r as T;
  }
}

export const getMetadatas = (target: any) => {
  return (...keys: string[]) => {
    return Object.fromEntries(keys.map((k) => [k, Reflect.getMetadata(k, target)]));
  };
};

export const isRequestHandler = (target: any) => getMetadataDefaultOrThrow<boolean>(target, c.HANDLER_MARK, false);
export const isEndpoint = (target: any) => getMetadataDefaultOrThrow<boolean>(target, c.ENDPOINT_MARK, false);

export const checkIsController = (target: any) => {
  if (!isEndpoint(target)) {
    throw new Error('error');
  }
  return target;
};

export const checkIsRequestHandler = (target: any) => {
  if (!isRequestHandler(target)) {
    throw new Error('error');
  }
  return target;
};

export const getEndpointBasePath = (target: any) => getMetadataDefaultOrThrow<string>(checkIsController(target), 'path');

export const getHandlerMethod = (target: any) => getMetadataDefaultOrThrow<string>(checkIsRequestHandler(target), 'method');
export const getHandlerPath = (target: any) => getMetadataDefaultOrThrow<string>(checkIsRequestHandler(target), 'path');

interface RequestHandlerProps {
  name: string;
  method: string;
  path: string;
  descriptor: RequestHandlerDescriptor;
}

export function getRequestHandlersFromEndpoint<TEndpoint extends ClzType<any>>(Endpoint: TEndpoint): Array<RequestHandlerProps> {
  const ds = Object.getOwnPropertyDescriptors(Endpoint.prototype);

  return Object.entries(ds)
    .filter(([_, d]) => isRequestHandler(d.value))
    .map(([name, d]) => {
      return {
        name,
        method: getHandlerMethod(d.value),
        path: `${getEndpointBasePath(Endpoint)}${getHandlerPath(d.value)}`,
        descriptor: d
      };
    });
}

export function getRequestHandlerParameters<TEndpoint extends ClzType<any>>(Endpoint: TEndpoint, name: string) {
  const parameterEntries: Array<[HandlerParamsType, number]> = Reflect.getMetadataKeys(Endpoint.prototype, name)
    .filter((k) => (k as string).startsWith(c.HANDLER_PARAMS_METADATA_PREFIX))
    .map((k) => [Reflect.getMetadata(k, Endpoint.prototype, name), Number((k as string).slice(c.HANDLER_PARAMS_METADATA_PREFIX.length + 1))]);

  return new Map(parameterEntries);
}

export function getMethodParamTypes(Target: ClzType<any>, methodName: string) {
  return Reflect.getMetadata('design:paramtypes', Target.prototype, methodName);
}


export function getMethodAsyncReturnTypes(Target: ClzType<any>, methodName: string) {
  return Reflect.getMetadata('design:asyncreturntype', Target.prototype, methodName) ?? undefined;
}
