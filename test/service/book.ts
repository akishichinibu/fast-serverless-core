import { awsExport } from "src/adapter/aws";
import * as a from "src/decorators";


class PathParameter {
  id!: number;
}


a.Endpoint({
  baseUri: "/books",
})
class BookService extends a.BaseEndpoint {

  @a.Get({
    path: "",
  })
  async get(@a.Path(() => PathParameter) { id }: PathParameter) {
    return [1, 2, 3];
  }
}


export default awsExport(BookService);
