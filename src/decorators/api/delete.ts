import Api, { ApiProps } from './base';

interface Props extends Omit<ApiProps, 'httpMethod'> {}

function Delete(props: Props) {
  return Api({
    ...props,
    httpMethod: 'delete'
  });
}

export default Delete;
