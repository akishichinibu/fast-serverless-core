import Endpoint, { BaseEndpoint, EndpointProps } from "./endpoint";
import { Get, Post, Patch, Put, Delete } from "./api";
import { Path, Query, Body, ClzerType } from "./params";

import { HandlerProps } from "./api/base";
import { ClzType } from "src/type";
import { Handler } from "aws-lambda";


interface EndpointModule {
  _: BaseEndpoint;
  methods: Array<string>;
}


type Adapter = (h: Handler, endpointProps: EndpointProps, handlerProps: HandlerProps) => Handler;


type EndpointClz<T extends BaseEndpoint> = ClzType<T>;


function export_<T extends BaseEndpoint>(Model: EndpointClz<T>, adapter: Adapter): EndpointModule {
  const m = new Model();

  const entries = Array
    .from(m.handlersProps)
    .map(([methodName, handlerProps]) => {
      return [
        methodName,
        adapter(
          handlerProps.methodDescriptor.value.bind(m), 
          m.endpointProps, 
          handlerProps,
        ),
      ]
    });

  const r = Object.fromEntries(entries);
  r["_"] = m;
  r["methods"] = Array.from(m.handlersProps).map(([methodName]) => methodName);
  return r;
}


export {
  Endpoint,
  EndpointProps,
  BaseEndpoint,
  EndpointModule,
  EndpointClz,

  Get, Post, Patch, Put, Delete,
  Path,
  Query,
  Body,
  export_,
}
