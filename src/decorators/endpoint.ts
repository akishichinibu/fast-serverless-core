import { IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { ENDPOINT_MARK } from 'src/constants';

import { defineInternalMetadata } from 'src/metadata/utils';
import { ClzType } from 'src/type';
import { endpointBaseUrlRegex } from 'src/utils';
import { HandlerProps } from './handler';

const logger = (...data: any[]) => console.debug(...['[endpoint]', ...data]);

export class EndpointProps {
  @Matches(endpointBaseUrlRegex)
  @IsNotEmpty()
  path!: string;

  apiProps?: Partial<HandlerProps>;

  @IsOptional()
  authorizer?: string;
}

export function Endpoint(endpointProps: EndpointProps) {
  return function <T>(Base: ClzType<T>) {
    defineInternalMetadata(Base)({
      [ENDPOINT_MARK]: true,
      path: endpointProps.path,
      apiProps: endpointProps.apiProps ?? {}
    });
    return Base;
  };
}
