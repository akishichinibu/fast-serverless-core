import { plainToInstance } from 'class-transformer';
import { ValidatorOptions, validateOrReject, ValidationError } from 'class-validator';
import { HttpException, ValidationException } from 'src/exception';
import {
  getHandlerMethod,
  getEndpointBasePath,
  getHandlerPath,
  getRequestHandlerParameters,
  getRequestHandlersFromEndpoint,
  getMethodParamTypes
} from 'src/metadata';
import { ClzType, Nullable, RequestHandlerDescriptor } from 'src/type';
import { profiling } from 'src/utils';

const logger = (...data: any[]) => console.debug(...['[adapter:aws] ', ...data]);

export type KVObject = { [key: string]: any };

export abstract class AbstractHandlerAdapter<TEvent, TResponse> {
  private async _validate(obj: any, props?: ValidatorOptions) {
    try {
      await validateOrReject(obj, {
        forbidUnknownValues: true,
        // version: apiProps.version,
        ...(props ?? {})
      });

      return obj;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new ValidationException(error);
      } else {
        throw error;
      }
    }
  }

  private bothNullOrFailed<T extends any, R extends any>(Clz: Nullable<ClzType<T>>, params: Nullable<R>, name: string) {
    if (Clz === null) {
      if (params === null) {
        return;
      } else {
        throw new ValidationException({
          message: `The current request should NOT have the ${name}. `
        });
      }
    }
  }

  abstract getRequestId(event: TEvent): Promise<string>;

  abstract serializeResponseBody(obj: any): Promise<string>;

  abstract parsePathParameter(event: TEvent): Promise<KVObject>;

  abstract parseQueryParameter(event: TEvent): Promise<KVObject>;

  abstract parseRequestBody(event: TEvent): Promise<KVObject>;

  abstract constructSuccessResult(result: any): Promise<TResponse>;

  abstract constructHttpErrorResult(error: HttpException): Promise<TResponse>;

  abstract constructUnknownErrorResult(error: any): Promise<TResponse>;

  private async parseAndValidatePathParameter(event: TEvent, Clz: Nullable<ClzType<any>>): Promise<KVObject> {
    const obj = await this.parsePathParameter(event);
    this.bothNullOrFailed(Clz, obj, 'path parameters');

    const options = {
      enableImplicitConversion: true
    };

    const r = plainToInstance(Clz!, obj!, options);
    return await this._validate(r);
  }

  private async parseAndValidateQueryParameter(event: TEvent, Clz: Nullable<ClzType<any>>): Promise<KVObject> {
    const obj = await this.parseQueryParameter(event);

    this.bothNullOrFailed(Clz, obj, 'query parameters');

    const options = {
      enableImplicitConversion: true,
      exposeDefaultValues: true
    };

    const r = plainToInstance(Clz!, obj!, options);
    return await this._validate(r);
  }

  private async parseAndValidateRequestBody(event: TEvent, Clz: Nullable<ClzType<any>>): Promise<KVObject> {
    const obj = await this.parseRequestBody(event);

    this.bothNullOrFailed(Clz, obj, 'request body');

    const options = {
      enableImplicitConversion: false,
      exposeDefaultValues: true
    };

    const r = plainToInstance(Clz!, obj!, options);
    return await this._validate(r);
  }

  private async fullfillArguments<TEndpoint extends ClzType<any>>(Endpoint: TEndpoint, name: string, descriptor: RequestHandlerDescriptor, event: TEvent) {
    const parameterIndexMap = getRequestHandlerParameters(Endpoint, name);
    const args = [];

    for (let [argsType, index] of parameterIndexMap) {
      const ParameterClz: Nullable<ClzType<any>> = getMethodParamTypes(Endpoint, name)[index]!;

      switch (argsType) {
        case 'path': {
          args[index] = await this.parseAndValidatePathParameter(event, ParameterClz);
          break;
        }
        case 'query': {
          args[index] = await this.parseAndValidateQueryParameter(event, ParameterClz);
          break;
        }
        case 'body': {
          args[index] = await this.parseAndValidateRequestBody(event, ParameterClz);
          break;
        }
      }
    }

    return args;
  }

  adapt<T = any>(handlerName: string, instance: T): (event: TEvent) => Promise<TResponse> {
    // @ts-ignore
    const Constructor: ClzType<T> = instance.constructor;

    const handlers = getRequestHandlersFromEndpoint(Constructor).filter(({ name }) => name === handlerName);

    if (handlers.length !== 1) {
      throw new Error('!');
    }

    const { descriptor } = handlers[0];

    return async (event: TEvent) => {
      const requestId = await this.getRequestId(event);

      try {
        const args = await this.fullfillArguments(Constructor, handlerName, descriptor, event);
        // logger(`prepare to handle api request to ${apiProps.path}. arguments: ${arguments_.map((r) => r.toString()).join(', ')}`, parameterArgumentMapping);

        // const finalArguments = arguments_.map((r) => parameterArgumentMapping.get(r)).filter((r) => r !== null);

        // logger(`The proposed arguments: `, finalArguments);

        const method = getHandlerMethod(descriptor.value);
        const baseUri = getEndpointBasePath(Constructor);
        const path = getHandlerPath(descriptor.value);

        const [cost, result] = await profiling((...args: any[]) => descriptor.value?.call(instance, ...args), args);

        logger(`[profile] [${method} ${baseUri}/${path}] execution costs [${cost}] ms. `);

        return await this.constructSuccessResult(result);
      } catch (error) {
        if (error instanceof HttpException) {
          return await this.constructHttpErrorResult(error);
        } else {
          console.error(error);
          return await this.constructUnknownErrorResult(error);
        }
      }
    };
  }
}
