import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from 'class-validator';

import { HttpMethod } from 'src/type';
import { endpointBaseUrlRegex } from 'src/utils';
import { defineMetadatas } from 'src/metadata';
import { HANDLER_MARK, HttpMethodEnum } from 'src/constants';

export class HandlerProps {
  @IsNumber()
  @IsOptional()
  version?: number;

  @Matches(endpointBaseUrlRegex)
  @IsString()
  @IsNotEmpty()
  path!: string;

  @IsEnum(HttpMethodEnum)
  @IsString()
  @IsNotEmpty()
  httpMethod!: HttpMethod;
}

function Handler(props: HandlerProps) {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    defineMetadatas(descriptor.value)({
      [HANDLER_MARK]: true,
      path: props.path,
      method: props.httpMethod,
      version: props.version
    });
  };
}

interface Props extends Omit<HandlerProps, 'httpMethod'> { }

function createHttpMethodHandler(method: HttpMethod) {
  return (props: Props) => {
    return Handler({
      ...props,
      httpMethod: method
    });
  };
}

export const Get = createHttpMethodHandler('GET');

export const Post = createHttpMethodHandler('POST');

export const Put = createHttpMethodHandler('PUT');

export const Patch = createHttpMethodHandler('PATCH');

export const Delete = createHttpMethodHandler('DELETE');
