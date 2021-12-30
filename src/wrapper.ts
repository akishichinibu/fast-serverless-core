import { HttpStatusCodes } from './http';
import { EndpointProps } from './decorators';
import { HandlerProps } from './decorators/api/base';
import { ExceptionHandler } from './decorators/endpoint';
import { APIHandlerException } from './exception';
import { Nullable, ClzerType } from './type';
import { profiling } from './utils';
import { validatePathParams, validateQueryParameter, validateRequestBody, validateResponseBody } from './validation';

const wrapperLogger = (...data: any[]) => console.debug(...['[wrapper]', ...data]);

type RequestHandler = (...data: any[]) => any;

const nullableCall = (clzer: Nullable<ClzerType> | undefined) => {
  return clzer === null || clzer === undefined ? null : clzer();
};

interface WrapperProps {
  h: RequestHandler;
  endpointProps: EndpointProps;
  handlerProps: HandlerProps;
}

interface HandlerInput {
  pathParameters: any;
  queryParameters: any;
  requestBody: any;
}

function exceptionHandler(error: any, externalExceptionHandler?: ExceptionHandler): any {
  try {
    if (externalExceptionHandler) {
      const result = externalExceptionHandler(error);
      if (result) {
        return result;
      }
    } else {
      throw error;
    }
  } catch (error) {
    if (error instanceof APIHandlerException) {
      return {
        statusCode: error.statusCode,
        body: error.messages
      };
    } else {
      console.error(error);
      return {
        statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        body: ''
      };
    }
  }
}

export function wrapper({ h, endpointProps, handlerProps }: WrapperProps) {
  const { apiProps, validation, arguments_ } = handlerProps;

  wrapperLogger(`Process the handler of endpoint ${apiProps.path}...`);

  return async (handlerProps: HandlerInput) => {
    const pathParameters = await validatePathParams(nullableCall(validation.path), handlerProps.pathParameters);
    const queryParameters = await validateQueryParameter(nullableCall(validation.query), handlerProps.queryParameters);
    const requestBody = await validateRequestBody(nullableCall(validation.request), handlerProps.requestBody);

    const parameterArgumentMapping = new Map<string, any>([
      ['path', pathParameters],
      ['query', queryParameters],
      ['request', requestBody]
    ]);

    try {
      wrapperLogger(
        `prepare to handle api request to ${apiProps.path}. arguments: ${arguments_.map((r) => r.toString()).join(', ')}`,
        parameterArgumentMapping
      );

      const finalArguments = arguments_.map((r) => parameterArgumentMapping.get(r)).filter((r) => r !== null);

      wrapperLogger(`The proposed arguments: `, finalArguments);

      const [cost, returnedBody] = await profiling(h, finalArguments);

      wrapperLogger(`[profile] [${apiProps.httpMethod} ${endpointProps.baseUri}/${apiProps.path}] execution costs [${cost}] ms. `);

      const body = await validateResponseBody(nullableCall(apiProps.response), returnedBody);

      if (body === null) {
        return {
          statusCode: HttpStatusCodes.NO_CONTENT,
          body: ''
        };
      } else {
        return {
          statusCode: HttpStatusCodes.OK,
          body: JSON.stringify(body)
        };
      }
    } catch (error) {
      return exceptionHandler(error, endpointProps.exceptionHandler);
    }
  };
}
