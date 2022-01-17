import 'reflect-metadata';
import * as c from 'src/constants';

const toInternalMetaKey = (key: string) => `${c.FAST_METAKEY_PREFIX}: ${key}`;
const isInternalMetaKey = (key: string) => key.startsWith(c.FAST_METAKEY_PREFIX);

export function getInternalMetadataKeys(target: any, propertyKey?: string | symbol): string[] {
  const keys = propertyKey == undefined ? Reflect.getMetadataKeys(target) : Reflect.getMetadataKeys(target, propertyKey);
  return keys.filter(isInternalMetaKey);
}

export function getInternalMetadata<T = any>(target: any, key: string, propertyKey?: string | symbol) {
  const k = toInternalMetaKey(key);
  const r = propertyKey == undefined ? Reflect.getMetadata(k, target) : Reflect.getMetadata(k, target, propertyKey);
  return r as T;
}

const _defineInternalMetadata = (target: any, key: string, value: any, propertyKey?: string | symbol) => {
  const k = toInternalMetaKey(key);
  return propertyKey === undefined ? Reflect.defineMetadata(k, value, target) : Reflect.defineMetadata(k, value, target, propertyKey);
};

export const defineInternalMetadata = (target: any, propertyKey?: string | symbol) => {
  return (data: { [key: string]: any }) => {
    Object.entries(data).forEach(([k, v]) => _defineInternalMetadata(target, k, v, propertyKey));
  };
};

export function getInternalMetadataDefaultOrThrow<T>(target: any, key: string, default_?: T) {
  const r = getInternalMetadata(target, key);

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

export const getAllInternalMetadata = (target: any, propertyKey?: string | symbol) => {
  const entries = getInternalMetadataKeys(target, propertyKey)
    .map((k) => [k, getInternalMetadata(target, k, propertyKey)] as [string, any])
    .filter(([k, _]) => isInternalMetaKey(k));
  return Object.fromEntries(entries);
};

export function getMetadata<T = any>(target: any, key: string, propertyKey?: string | symbol) {
  const r = propertyKey == undefined ? Reflect.getMetadata(key, target) : Reflect.getMetadata(key, target, propertyKey);
  return r as T;
}

export const defineMetadata = (target: any, key: string, value: any, propertyKey?: string | symbol) => {
  return propertyKey === undefined ? Reflect.defineMetadata(key, value, target) : Reflect.defineMetadata(key, value, target, propertyKey);
};
