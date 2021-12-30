import { APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { classToPlainFromExist, plainToClassFromExist } from 'class-transformer';
import { validateOrReject, ValidatorOptions } from 'class-validator';
import { StatusCodes } from 'http-status-codes';

import { HandlerProps } from 'src/decorators/api/base';
import { EndpointProps } from 'src/decorators/endpoint';
import { EndpointClz, export_ } from 'src/decorators';
import { profiling } from 'src/utils';

const logger = (...data: any[]) => console.debug(...['[adapter:aws] ', ...data]);

export type LambdaRequestHandler = (...params: any[]) => Promise<APIGatewayProxyResult>;

export function awsHanlderAdapter(h: LambdaRequestHandler, endpointProps: EndpointProps, handlerProps: HandlerProps): APIGatewayProxyHandler {
  const { exceptionHandler } = endpointProps;
  const { apiProps, validation, arguments_ } = handlerProps;

  const _validate = async (obj: any, props?: ValidatorOptions) => {
    return await validateOrReject(obj, {
      forbidUnknownValues: true,
      version: apiProps.version,
      ...(props ?? {})
    });
  };

  const generateRawBody = async (body: any) => {
    if (apiProps.response) {
      const r = classToPlainFromExist(body, { groups: ['user'] });
      const rr = plainToClassFromExist(apiProps.response(), r, { groups: ['user'] });
      console.debug(`[debug] received the reponse: `, body, r, rr);
      // await _validate(r);
      return JSON.stringify(rr);
    } else {
      return '';
    }
  };

  return async function (event) {
    logger(`Validation settings for endpoint ${apiProps.path}`, validation);

    const handlePathParameter = async () => {
      const PathParameterClz = validation.path!();
      const r = plainToClassFromExist(PathParameterClz, event.pathParameters || {}, {
        enableImplicitConversion: true
      });
      await _validate(r);
      return r;
    };

    const handleQueryParameter = async () => {
      const QueryParameterClz = validation.query!();

      const allParameters: { [key: string]: any } = {
        ...(event.queryStringParameters || {})
      };

      for (const [k, vs] of Object.entries(event.multiValueQueryStringParameters || {})) {
        if (vs && vs.length > 1) {
          allParameters[k] = vs;
        }
      }

      const r = plainToClassFromExist(QueryParameterClz, allParameters, {
        enableImplicitConversion: true,
        exposeDefaultValues: true
      });

      await _validate(r);
      return r;
    };

    const handleRequestBody = async () => {
      const BodyClz = validation.request!();
      const rawBody = event.body ? JSON.parse(event.body) : {};

      const r = plainToClassFromExist(BodyClz, rawBody, {
        enableImplicitConversion: false
      });

      await _validate(r);
      return r;
    };

    let pathParameters: any;
    let queryParameters: any;
    let requestBody: any;

    try {
      pathParameters = validation.path ? await handlePathParameter() : null;
      queryParameters = validation.query ? await handleQueryParameter() : null;
      requestBody = validation.request ? await handleRequestBody() : null;
    } catch (error) {
      console.error(`Validation error occurs in request [${event.requestContext.requestId}]: ${error}`);

      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: JSON.stringify({
          errors: [error]
        })
      };
    }

    const parameterArgumentMapping = new Map<string, any>([
      ['path', pathParameters],
      ['query', queryParameters],
      ['request', requestBody]
    ]);

    try {
      logger(`prepare to handle api request to ${apiProps.path}. arguments: ${arguments_.map((r) => r.toString()).join(', ')}`, parameterArgumentMapping);

      const finalArguments = arguments_.map((r) => parameterArgumentMapping.get(r)).filter((r) => r !== null);

      logger(`The proposed arguments: `, finalArguments);

      const [cost, responseBody] = await profiling(h, finalArguments);

      logger(`[profile] [${apiProps.httpMethod} ${endpointProps.baseUri}/${apiProps.path}] execution costs [${cost}] ms. `);

      const rawBody = await generateRawBody(responseBody);

      return {
        statusCode: StatusCodes.OK,
        body: rawBody
      };
    } catch (error) {
      try {
        if (exceptionHandler) {
          const result = exceptionHandler(error);
          if (result) {
            return result;
          }
        }
      } catch (error) {
        console.error(error);

        return {
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          body: ''
          // do not return the unexpected error message
        };
      }

      throw error;
    }
  };
}

// @ts-ignore
export const awsExport = (Model: EndpointClz<any>) => export_(Model, awsHanlderAdapter);
