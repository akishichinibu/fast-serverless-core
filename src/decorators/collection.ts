import { BaseEndpoint, EndpointProps } from './endpoint';
import { HandlerProps } from './api/base';
import { ClzType } from 'src/type';

interface MetaDataType {
  endpointProps: EndpointProps;
  handlersProps: Map<string, HandlerProps>;
}

export const metaDataCollection = new Map<number, MetaDataType>();

export const serviceClzCollection = new Map<number, ClzType<BaseEndpoint>>();
