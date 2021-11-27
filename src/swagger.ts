import { OpenAPIObject, OperationObject, ParameterObject } from "openapi3-ts";
import { targetConstructorToSchema } from "class-validator-jsonschema";

import { EndpointModule } from "./decorators";
import metaDataCollection from "./decorators/collection";


export function generateSwagger(modules: Array<EndpointModule>) {
  const s: OpenAPIObject = {
    openapi: "3.0.0",
    info: {
      title: "",
      version: "",
    },
    paths: Object.assign({}, ...modules.filter(r => r !== null).map(generateFromModule)),
  }

  return s;
}


const JSON_MIME_CONTENT_TYPE = "application/json";


function generateFromModule(module: EndpointModule): OpenAPIObject["paths"] {
  const instance = module["_"];
  const endpointId = instance.endpointId;
  const { endpointProps, handlersProps } = metaDataCollection.get(endpointId)!;
  
  const ps: OpenAPIObject["paths"] = {};
  const { baseUri } = endpointProps;

  for (const [methodName, { apiProps: { httpMethod, path }, validation }] of handlersProps.entries()) {
    const fp = `${baseUri}/${path}`;
    ps[fp] || (ps[fp] = {});

    const methodDoc: OperationObject = {
      summary: "",
      responses: {
        "200": {
          description: "",
        }
      }
    }

    if (validation.path) {
      const Clzer = validation.path();
      const schema = targetConstructorToSchema(Clzer);

      Object
        .entries(schema.properties || {})
        .forEach(([name, schema]) => {
          const p: ParameterObject = {
            in: "path",
            name,
            required: true,
            schema,
          }

          methodDoc.parameters || (methodDoc.parameters = []);
          methodDoc.parameters.push(p);
        });
    }

    if (validation.query) {
      const Clzer = validation.query();
      const schema = targetConstructorToSchema(Clzer);

      Object
        .entries(schema.properties || {})
        .forEach(([name, schema]) => {
          const p: ParameterObject = {
            in: "query",
            name,
            required: true,
            schema,
          }

          methodDoc.parameters || (methodDoc.parameters = []);
          methodDoc.parameters.push(p);
        });
    }

    if (validation.request) {
      const Clzer = validation.request();

      methodDoc.requestBody = {
        description: "",
        content: {
          [JSON_MIME_CONTENT_TYPE]: {
            schema: targetConstructorToSchema(Clzer),
          }
        }
      }
    }

    ps[fp][httpMethod] = methodDoc;
  }

  return ps;
}
