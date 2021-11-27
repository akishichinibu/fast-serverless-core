import Api, { ApiProps } from "./base";


interface Props extends Omit<ApiProps,　"httpMethod"> {
  
}


function Get(props: Props) {
  return Api({
    ...props,
    httpMethod: "get",
  });
}


export default Get;
