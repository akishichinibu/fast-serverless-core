import { APIGatewayProxyResult } from 'aws-lambda';
import { IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { MetaDataError } from 'src/exception';

import { ClzType } from 'src/type';
import { endpointBaseUrlRegex } from 'src/utils';
import { HandlerProps, handlersMetaDataKey, ApiProps } from './api/base';
import { metaDataCollection, serviceClzCollection } from './collection';

const logger = (...data: any[]) => console.debug(...['[endpoint]', ...data]);

export type ExceptionHandler = (error: any) => APIGatewayProxyResult;

export class EndpointProps {
  @Matches(endpointBaseUrlRegex)
  @IsNotEmpty()
  baseUri!: string;

  exceptionHandler?: ExceptionHandler;

  apiProps?: Partial<ApiProps>;

  @IsOptional()
  authorizer?: string;
}

export abstract class BaseEndpoint {
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

function checkIfBaseEndpoint(B: ClzType<any>) {
  if (!(B.prototype instanceof BaseEndpoint)) {
    throw new MetaDataError(`The given endpoint class is not base of BaseEndpoint. `);
  }
}

function fetchHandlerProps(B: ClzType<BaseEndpoint>) {
  const props = B.prototype[handlersMetaDataKey];

  if (props === undefined) {
    throw new MetaDataError(`Can not fetch the handler properties. `);
  }

  return props;
}

function Endpoint(endpointProps: EndpointProps) {
  return function <T extends ClzType<BaseEndpoint>>(Base: T) {
    checkIfBaseEndpoint(Base);

    const { baseUri, apiProps } = endpointProps;
    const _endpointId = metaDataCollection.size;
    logger(`scan the settings of the endpoint [${baseUri}], props: `, JSON.stringify(endpointProps));

    const Clz = class extends Base implements BaseEndpoint {
      private readonly _endpointId: number;
      private readonly _handlersProps: Map<string, HandlerProps>;
      private readonly _endpointProps: EndpointProps;

      constructor(...args: any[]) {
        super(...args);

        this._endpointId = _endpointId;
        this._endpointProps = endpointProps;
        this._handlersProps = fetchHandlerProps(Base);

        // inherit config from endpoint
        for (let [_, props] of this._handlersProps.entries()) {
          props.apiProps = Object.assign(props.apiProps, apiProps ?? {});
        }

        metaDataCollection.set(this._endpointId, {
          endpointProps,
          handlersProps: this._handlersProps
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

    serviceClzCollection.set(_endpointId, Clz);
    return Clz;
  };
}

export default Endpoint;
