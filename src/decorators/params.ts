import 'reflect-metadata';
import { ClzerType } from 'src/type';

function builder(metaKey: symbol | string) {
  return function (clzer: ClzerType) {
    return function (target: Object, propertyKey: string | symbol, parameterIndex: number) {
      if (Reflect.getMetadata(propertyKey, target, metaKey)) {
        throw new Error(`The ${metaKey.toString()} at index ${parameterIndex} has already existed in ${propertyKey.toString()}. `);
      }

      Reflect.defineMetadata(
        propertyKey,
        {
          clzer,
          index: parameterIndex
        },
        target,
        metaKey
      );
    };
  };
}

export const Path = builder('path');

export const Query = builder('query');

export const Body = builder('body');
