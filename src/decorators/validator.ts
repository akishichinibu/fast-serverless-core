import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { endpointUrlPartRegex } from 'src/utils';

export function IsUrlWithParams(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isUrlWithParams',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName] as string;
          // return typeof value === 'string' && typeof relatedValue === 'string' && value.length > relatedValue.length; // you can return a Promise<boolean> here as well, if you want to make async validation

          if (relatedValue === '') {
            return true;
          }

          for (let part of relatedValue.split('/')) {
            if (!part.match(endpointUrlPartRegex)) {
              return false;
            }
          }
        }
      }
    });
  };
}
