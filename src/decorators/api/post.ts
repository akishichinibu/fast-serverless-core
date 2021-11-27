import Api, { ApiProps } from "./base";


interface Props extends Omit<ApiProps,　"httpMethod"> {
  
}


function Post(props: Props) {
  return Api({
    ...props,
    httpMethod: "post",
  });
}


export default Post;
