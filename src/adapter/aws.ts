import 'reflect-metadata';
import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import { HttpException, ValidationException } from 'src/exception';
import { HttpStatusCodes } from 'src/constants';
import { AbstractHandlerAdapter, KVObject } from './base';

const logger = (...data: any[]) => console.debug(...['[adapter:aws] ', ...data]);

export class AWSHandlerAdapter extends AbstractHandlerAdapter<APIGatewayProxyEvent, APIGatewayProxyResult> {
  async getRequestId(event: APIGatewayProxyEvent): Promise<string> {
    return event.requestContext.requestId;
  }

  async constructSuccessResult(result: any): Promise<APIGatewayProxyResult> {
    if (result === null) {
      return {
        statusCode: HttpStatusCodes.NO_CONTENT,
        body: ''
      };
    } else {
      return {
        statusCode: HttpStatusCodes.OK,
        body: JSON.stringify(result)
      };
    }
  }

  async constructHttpErrorResult(error: HttpException): Promise<APIGatewayProxyResult> {
    return {
      statusCode: error.statusCode,
      body: JSON.stringify({ errors: error.messages })
    };
  }

  async constructUnknownErrorResult(error: any): Promise<APIGatewayProxyResult> {
    return {
      statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      body: ''
      // do not return the unexpected error message
    };
  }

  private dumpsJson(obj: any) {
    if (obj === null) {
      return '';
    } else {
      try {
        return JSON.stringify(obj);
      } catch (error) {
        if (error instanceof SyntaxError) {
          throw new ValidationException({
            message: `Try to convert the object to JSON but failed. `
          });
        } else {
          throw error;
        }
      }
    }
  }

  private loadsJson(obj: any) {
    if (obj === null) {
      return {};
    } else {
      try {
        return JSON.parse(obj);
      } catch (error) {
        if (error instanceof SyntaxError) {
          throw new ValidationException({
            message: `Try to parse the object as JSON but failed. `
          });
        } else {
          throw error;
        }
      }
    }
  }

  async serializeResponseBody(obj: any): Promise<string> {
    return this.dumpsJson(obj);
  }

  async parsePathParameter(event: APIGatewayProxyEvent): Promise<KVObject> {
    return event.pathParameters || {};
  }

  async parseQueryParameter(event: APIGatewayProxyEvent): Promise<KVObject> {
    const allParameters: KVObject = {
      ...(event.queryStringParameters || {})
    };

    for (const [k, vs] of Object.entries(event.multiValueQueryStringParameters || {})) {
      if (vs && vs.length > 1) {
        allParameters[k] = vs;
      }
    }

    return allParameters;
  }

  async parseRequestBody(event: APIGatewayProxyEvent): Promise<KVObject> {
    return this.loadsJson(event.body);
  }
}
