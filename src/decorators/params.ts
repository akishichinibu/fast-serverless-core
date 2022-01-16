import * as c from 'src/constants';
import { defineMetadatas } from 'src/metadata';

function createParamsDecorator(parameterType: symbol | string) {
  return function () {
    return function (target: Object, propertyKey: string | symbol, parameterIndex: number) {
      defineMetadatas(target, propertyKey)({ [`${c.HANDLER_PARAMS_METADATA_PREFIX}:${parameterIndex}`]: parameterType });
    };
  };
}

export const Path = createParamsDecorator(c.HandlerParamsEnum.Path);

export const Query = createParamsDecorator(c.HandlerParamsEnum.Query);

export const Body = createParamsDecorator(c.HandlerParamsEnum.Body);
