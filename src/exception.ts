import { ValidationError } from 'class-validator';
import { HttpStatusCodes } from './http';

export class MetaDataError extends Error {}

interface ErrorMessage {
  message: any;
}

export abstract class APIHandlerException<E = ErrorMessage> extends Error {
  abstract readonly statusCode: HttpStatusCodes;
  readonly messages: E[];

  constructor(...messages: E[]) {
    super();
    this.messages = messages;
  }
}

export class ValidationException extends APIHandlerException<ErrorMessage | ValidationError> {
  readonly statusCode: HttpStatusCodes = HttpStatusCodes.BAD_REQUEST;
}

export class UnknownException extends APIHandlerException<any> {
  readonly statusCode: HttpStatusCodes = HttpStatusCodes.INTERNAL_SERVER_ERROR;

  constructor(...messages: any[]) {
    super();
    messages.forEach((e) => {
      console.error(e);
    });
  }
}
