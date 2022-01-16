var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { IsArray, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";
import * as f from "src/decorators";
class PathParameter {
}
__decorate([
    Min(0),
    IsNumber(),
    IsNotEmpty(),
    __metadata("design:type", Number)
], PathParameter.prototype, "id", void 0);
class QueryParameter {
}
__decorate([
    IsNotEmpty(),
    IsArray(),
    __metadata("design:type", Array)
], QueryParameter.prototype, "parameter1", void 0);
__decorate([
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], QueryParameter.prototype, "parameter2", void 0);
let BookService = class BookService {
    async get({ id }, query) {
        console.log(query);
        return [1, 2, 3, id];
    }
};
__decorate([
    f.Get({
        path: "",
    }),
    f.ReturnType(PathParameter),
    __param(0, f.Path()),
    __param(1, f.Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PathParameter, QueryParameter]),
    __metadata("design:returntype", Promise)
], BookService.prototype, "get", null);
BookService = __decorate([
    f.Endpoint({
        path: "/books",
    })
], BookService);
export default BookService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vay5jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYm9vay5jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFrQixNQUFNLGlCQUFpQixDQUFDO0FBQy9GLE9BQU8sS0FBSyxDQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFHcEMsTUFBTSxhQUFhO0NBTWxCO0FBREM7SUFIQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ04sUUFBUSxFQUFFO0lBQ1YsVUFBVSxFQUFFOzt5Q0FDRDtBQUlkLE1BQU0sY0FBYztDQVNuQjtBQUxDO0lBRkMsVUFBVSxFQUFFO0lBQ1osT0FBTyxFQUFFOztrREFDWTtBQUl0QjtJQUZDLFFBQVEsRUFBRTtJQUNWLFVBQVUsRUFBRTs7a0RBQ087QUFPdEIsSUFBTSxXQUFXLEdBQWpCLE1BQU0sV0FBVztJQU1mLEtBQUssQ0FBQyxHQUFHLENBQVcsRUFBRSxFQUFFLEVBQWlCLEVBQWEsS0FBcUI7UUFDekUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQixPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDdkIsQ0FBQztDQUNGLENBQUE7QUFKQztJQUpDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDTCxJQUFJLEVBQUUsRUFBRTtLQUNULENBQUM7SUFDRCxDQUFDLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQztJQUNqQixXQUFBLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUF5QixXQUFBLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQTs7cUNBQXpCLGFBQWEsRUFBb0IsY0FBYzs7c0NBRzFFO0FBVEcsV0FBVztJQUhoQixDQUFDLENBQUMsUUFBUSxDQUFDO1FBQ1YsSUFBSSxFQUFFLFFBQVE7S0FDZixDQUFDO0dBQ0ksV0FBVyxDQVVoQjtBQUdELGVBQWUsV0FBVyxDQUFDIn0=