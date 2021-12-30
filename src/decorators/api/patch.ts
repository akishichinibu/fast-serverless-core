import Api, { ApiProps } from './base';

interface Props extends Omit<ApiProps, 'httpMethod'> {}

function Patch(props: Props) {
  return Api({
    ...props,
    httpMethod: 'patch'
  });
}

export default Patch;
