import { IsNotEmpty, Min } from "class-validator";
import * as f from "src";


class PathParameter {

  @Min(0)
  @IsNotEmpty()
  id!: number;
}


@f.Endpoint({
  baseUri: "/books",
})
class BookService extends f.BaseEndpoint {

  @f.Get({
    path: "",
  })
  async get(@f.Path(() => PathParameter) { id }: PathParameter) {
    return [1, 2, 3, id];
  }
}
