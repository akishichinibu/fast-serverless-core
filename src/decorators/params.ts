import * as c from 'src/constants';
import * as u from 'src/metadata/utils';
import { ClzType } from 'src/type';

function createParamsDecorator(parameterType: symbol | string) {
  return () => {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
      u.defineInternalMetadata(target, propertyKey)({ [`${c.HANDLER_PARAMS_METADATA_PREFIX}:${parameterIndex}`]: parameterType });
    };
  };
}

export const Path = createParamsDecorator(c.HandlerParamsMetaKeyEnum.Path);

export const Query = createParamsDecorator(c.HandlerParamsMetaKeyEnum.Query);

export const Body = createParamsDecorator(c.HandlerParamsMetaKeyEnum.Body);

export function ReturnType(type: ClzType<any>): MethodDecorator {
  return (target, propertyKey) => {
    u.defineMetadata(target, 'design:asyncreturntype', type, propertyKey);
  };
}
