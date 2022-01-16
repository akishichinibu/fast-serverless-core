import { IsArray, IsNotEmpty, IsNumber, IsString, Min, ValidateNested } from "class-validator";
import * as f from "src/decorators";


class PathParameter {

  @Min(0)
  @IsNumber()
  @IsNotEmpty()
  id!: number;
}


class QueryParameter {

  @IsNotEmpty()
  @IsArray()
  parameter1!: string[];

  @IsString()
  @IsNotEmpty()
  parameter2!: string;
}


@f.Endpoint({
  path: "/books",
})
class BookService {

  @f.Get({
    path: "",
  })
  @f.ReturnType(PathParameter)
  async get(@f.Path() { id }: PathParameter, @f.Query() query: QueryParameter) {
    console.log(query);
    return [1, 2, 3, id];
  }
}


export default BookService;
