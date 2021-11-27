
import { APIGatewayProxyResult } from "aws-lambda";
import { IsOptional, Matches } from "class-validator";

import { ClzType } from "../type";
import { HandlerProps, handlersMetaDataKey, ApiProps } from "./api/base";
import metaDataCollection from "./collection";


const logger = (...data: any[]) => console.debug(...["[endpoint] ", ...data]);


export type ExceptionHandler = (error: any) => APIGatewayProxyResult;


export class EndpointProps {

  @Matches(/\/\w+/)
  baseUri!: string;

  exceptionHandler?: ExceptionHandler;
  apiProps?: Partial<ApiProps>;

  @IsOptional()
  authorizer?: string;
}


export class BaseEndpoint {
  get export_(): { [key: string]: HandlerProps } {
    return {};
  }

  get endpointId(): number {
    return -1;
  }

  get handlersProps(): Map<string, HandlerProps> {
    return new Map();
  }

  get endpointProps(): EndpointProps {
    // @ts-ignore
    return {};
  }
}


function Endpoint(endpointProps: EndpointProps) {

  return function <T extends ClzType<BaseEndpoint>>(Base: T) {

    if (!(Base.prototype instanceof BaseEndpoint)) {
      throw new Error(`The given endpoint class is not base of BaseEndpoint. `);
    }

    const { baseUri, apiProps } = endpointProps;

    logger(`scan the settings of the endpoint [${baseUri}], props: `, JSON.stringify(endpointProps));
    // console.debug(`precheck the settings of the endpoint ${endpointName}, ${baseUri}`);

    // if (!baseUri.startsWith('/')) {
    //   throw new Error(`The baseUri ${baseUri} of endpoint ${endpointName} is invalid, it should start with '/'`);
    // }

    // if (baseUri.endsWith('/')) {
    //   throw new Error(`The baseUri ${baseUri} of endpoint ${endpointName} is invalid, it shouldn' end with '/'`);
    // }

    return class extends Base implements BaseEndpoint {

      readonly _endpointId: number;
      readonly _handlersProps: Map<string, HandlerProps>;
      readonly _endpointProps: EndpointProps;

      constructor(...args: any[]) {
        super(...args);

        this._handlersProps = Base.prototype[handlersMetaDataKey];

        if (this._handlersProps === undefined) {
          throw new Error(`Can not get the property with symbol ${handlersMetaDataKey.toString()}`)
        }

        this._endpointProps = endpointProps;

        // console.debug(`Starting to process the handlers in endpoint: [${endpointName}]`);

        // // check if validity of the endpoint setting
        // handlers.forEach(({ apiProps: { path } }, k) => {
        //   console.debug(`Found a handler: [${k}] in endpoint ${endpointName}`);
        // });

        // inherit config from endpoint
        for (let [_, props] of this._handlersProps.entries()) {
          props.apiProps = Object.assign(props.apiProps, apiProps ?? {});
        }

        this._endpointId = metaDataCollection.size;

        metaDataCollection.set(this._endpointId, {
          endpointProps,
          handlersProps: this._handlersProps,
        });
      }

      get handlersProps() {
        return this._handlersProps;
      }

      get endpointProps() {
        return this._endpointProps;
      }

      get endpointId(): number {
        return this._endpointId;
      }
    };
  }
}


export default Endpoint;
