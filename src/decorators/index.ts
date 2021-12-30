import Endpoint, { BaseEndpoint, EndpointProps } from './endpoint';
export { Get, Post, Patch, Put, Delete } from './api';
export { Path, Query, Body } from './params';

import { HandlerProps } from './api/base';
import { ClzType } from 'src/type';
import { Handler } from 'aws-lambda';

interface EndpointModule {
  _: BaseEndpoint;
  methods: Array<string>;
}

type Adapter = (h: Handler, endpointProps: EndpointProps, handlerProps: HandlerProps) => Handler;

type EndpointClz<T extends BaseEndpoint> = ClzType<T>;

function export_<T extends BaseEndpoint>(Model: EndpointClz<T>): EndpointModule {
  const m = new Model();

  const entries = Array.from(m.handlersProps).map(([methodName, handlerProps]) => {
    return [methodName, handlerProps.methodDescriptor.value.bind(m)];
  });

  const r = Object.fromEntries(entries);
  r['_'] = m;
  r['methods'] = Array.from(m.handlersProps).map(([methodName]) => methodName);
  return r;
}

export { Endpoint, EndpointProps, BaseEndpoint, EndpointModule, EndpointClz, export_ };
