import Api, { ApiProps } from './base';

interface Props extends Omit<ApiProps, 'httpMethod'> {}

function Put(props: Props) {
  return Api({
    ...props,
    httpMethod: 'put'
  });
}

export default Put;
