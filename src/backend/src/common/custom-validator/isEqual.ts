import { ValidateBy, ValidationArguments, ValidationOptions } from 'class-validator';

export function isEqual(property: string, validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isEqual',
      constraints: [property],
      validator: {
        validate(value, args: ValidationArguments): boolean {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return relatedValue === value;
        },
      },
    },
    validationOptions || { message: `require to match with ${property}` },
  );
}
