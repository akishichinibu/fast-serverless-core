import 'reflect-metadata';
import * as u from './utils';
import * as c from 'src/constants';
import { HandlerParamsMetaKeyType } from 'src/constants';
import { ClzType, RequestHandlerDescriptor } from 'src/type';

export const isRequestHandler = (target: any) => u.getInternalMetadataDefaultOrThrow<boolean>(target, c.HANDLER_MARK, false);
export const isEndpoint = (target: any) => u.getInternalMetadataDefaultOrThrow<boolean>(target, c.ENDPOINT_MARK, false);

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

export const getEndpointBasePath = (target: any) => u.getInternalMetadataDefaultOrThrow<string>(checkIsController(target), 'path');

export const getHandlerMethod = (target: any) => u.getInternalMetadataDefaultOrThrow<string>(checkIsRequestHandler(target), 'method');
export const getHandlerPath = (target: any) => u.getInternalMetadataDefaultOrThrow<string>(checkIsRequestHandler(target), 'path');

interface RequestHandlerProps {
  name: string;
  method: string;
  path: string;
  descriptor: RequestHandlerDescriptor;
}

export function getRequestHandlersFromController<TEndpoint extends ClzType<any>>(Endpoint: TEndpoint): Array<RequestHandlerProps> {
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

export function getRequestHandlerParameters<TEndpoint extends ClzType<any>>(Endpoint: TEndpoint, propertyName: string) {
  const parameterEntries: Array<[HandlerParamsMetaKeyType, number]> = u
    .getInternalMetadataKeys(Endpoint.prototype, propertyName)
    .filter((k) => k.startsWith(c.HANDLER_PARAMS_METADATA_PREFIX))
    .map((k) => [u.getInternalMetadata(Endpoint.prototype, k, propertyName), Number(k.slice(c.HANDLER_PARAMS_METADATA_PREFIX.length + 1))]);

  return new Map(parameterEntries);
}

export const getMethodParamTypes = (Target: ClzType<any>, methodName: string) => u.getMetadata(Target.prototype, 'design:paramtypes', methodName);

export const getMethodAsyncReturnTypes = (Target: ClzType<any>, methodName: string) =>
  u.getMetadata(Target.prototype, 'design:asyncreturntype', methodName) ?? undefined;
