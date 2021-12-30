import { plainToInstance } from 'class-transformer';
import { ValidatorOptions, validateOrReject, ValidationError } from 'class-validator';
import { UnknownException, ValidationException } from './exception';
import { ClzType, Nullable } from './type';

const _validate = async (obj: any, props?: ValidatorOptions) => {
  try {
    await validateOrReject(obj, {
      forbidUnknownValues: true,
      ...(props ?? {})
    });
    return obj;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new ValidationException(error);
    } else {
      throw new UnknownException(error);
    }
  }
};

function bothNullOrFailed<T extends any, R extends any>(Clz: Nullable<ClzType<T>>, params: Nullable<R>, name: string) {
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

export async function validatePathParams<T extends any, R extends any>(Clz: Nullable<ClzType<T>>, params: Nullable<R>) {
  bothNullOrFailed(Clz, params, 'path parameters');

  const options = {
    enableImplicitConversion: true
  };

  const r = plainToInstance<T, R>(Clz!, params!, options);
  return await _validate(r);
}

export async function validateQueryParameter<T extends any, R extends any>(Clz: Nullable<ClzType<T>>, params: Nullable<R>) {
  bothNullOrFailed(Clz, params, 'query parameters');

  const options = {
    enableImplicitConversion: true,
    exposeDefaultValues: true
  };

  const r = plainToInstance<T, R>(Clz!, params!, options);
  return await _validate(r);
}

export async function validateRequestBody<T extends any, R extends any>(Clz: Nullable<ClzType<T>>, params: Nullable<R>) {
  bothNullOrFailed(Clz, params, 'request body');

  const options = {
    enableImplicitConversion: false,
    exposeDefaultValues: true
  };

  const r = plainToInstance<T, R>(Clz!, params!, options);
  return await _validate(r);
}

export async function validateResponseBody<T extends any, R extends any>(Clz: Nullable<ClzType<T>>, params: Nullable<R>) {
  bothNullOrFailed(Clz, params, 'response body');

  const options = {
    enableImplicitConversion: false,
    exposeDefaultValues: false
  };

  const r = plainToInstance<T, R>(Clz!, params!, options);
  return await _validate(r);
}
