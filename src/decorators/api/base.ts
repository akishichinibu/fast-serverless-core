import { IsEnum, IsNotEmpty, IsNumber, IsOptional, Matches, ValidateNested } from 'class-validator';

import { Nullable, ClzerType } from 'src/type';
import { HttpMethod, HttpMethodEnum } from 'src/http';
import { endpointBaseUrlRegex } from 'src/utils';

export const handlersMetaDataKey = Symbol('handlers');

export interface ValidationProps {
  path: Nullable<ClzerType>;
  query: Nullable<ClzerType>;
  request: Nullable<ClzerType>;
}

export class ApiProps {
  @IsNumber()
  @IsOptional()
  version?: number;

  @Matches(endpointBaseUrlRegex)
  @IsNotEmpty()
  path!: string;

  @IsEnum(HttpMethodEnum)
  @IsNotEmpty()
  httpMethod!: HttpMethod;

  response?: ClzerType;
}

export class HandlerProps {
  methodName!: string;
  methodDescriptor!: PropertyDescriptor;

  @ValidateNested()
  apiProps!: ApiProps;

  validation!: ValidationProps;

  arguments_!: Array<keyof ValidationProps>;
}

function Api(props: ApiProps) {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const p = propertyKey.toString();

    if (p.startsWith('_')) {
      throw new Error(`The handler method name ${p} may not start with '_'. `);
    }

    target[handlersMetaDataKey] = target[handlersMetaDataKey] || new Map();
    const handlers: Map<string, HandlerProps> = target[handlersMetaDataKey];

    const arguments_: Array<keyof ValidationProps> = [];
    const validationEntries = [];

    for (let k of ['path', 'query', 'request']) {
      const r = Reflect.getMetadata(propertyKey, target, k);

      if (r === undefined) {
        validationEntries.push([k, null]);
      } else {
        const { clzer, index } = r;
        arguments_[index] = k as any;
        validationEntries.push([k, clzer]);
      }
    }

    const handlerProps = {
      methodName: p,
      methodDescriptor: descriptor,
      apiProps: props,
      validation: Object.fromEntries(validationEntries) as any,
      arguments_
    };

    handlers.set(p, handlerProps);
  };
}

export default Api;
