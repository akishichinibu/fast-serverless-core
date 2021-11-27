import { BaseEndpoint, EndpointProps } from "./endpoint";
import { HandlerProps } from "./api/base";


interface MetaDataType {
  endpointProps: EndpointProps;
  handlersProps: Map<string, HandlerProps>;
}


const metaDataCollection = new Map<any, MetaDataType>();

export default metaDataCollection;
