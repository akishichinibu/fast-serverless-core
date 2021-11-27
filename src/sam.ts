import { EndpointModule } from "./decorators";
import metaDataCollection from "./decorators/collection";


interface FunctionProperties {
  CodeUri: string;
  Handler: string;
  Runtime?: string;
  Events: { [event: string]: FunctionEvent };
}


interface FunctionEvent {
  Type: "Api";
  Properties: FunctionEventProperties;
}


interface FunctionEventProperties {
  Path: string;
  Method: "get";
}


interface Function {
  Type: "AWS::Serverless::Function";
  Properties: FunctionProperties;
}


interface GlobalSettings {
  Function: { [key: string]: any };
}


interface Template {
  AWSTemplateFormatVersion: "2010-09-09";
  Transform: "2010-09-09";
  Globals: GlobalSettings;
  Resources: { [func: string]: Function };
}


export function generateSAMTemplate(modules: Array<EndpointModule>) {
  const t: Template = {
    AWSTemplateFormatVersion: "2010-09-09",
    Transform: "2010-09-09",
    Globals: {
      Function: {
        Timeout: 3,
        Runtime: "nodejs14.x",
      }
    },
    Resources: {},
  };

  for (const m of modules) {
    const [logicalId, func] = generateFromModule(m);
    t.Resources[logicalId] = func;
  }

  return t;
}


function generateFromModule(module: EndpointModule): [string, Function] {
  const instance = module["_"];
  const endpointId = instance.endpointId;
  const { endpointProps, handlersProps } = metaDataCollection.get(endpointId)!;

  const events = [];

  for (let [methodName, {  }] of handlersProps.entries()) {
  }

  return [
    "",
    {
      Type: "AWS::Serverless::Function",
      Properties: {
        CodeUri: "",
        Handler: "",
        Events: events,
        // Events: {
        //   "": {
        //     Type: "Api",
        //     Properties: {
        //       Path: "",
        //       Method: "get",
        //     }
        //   }
        // }
      }
    }
  ]
}
