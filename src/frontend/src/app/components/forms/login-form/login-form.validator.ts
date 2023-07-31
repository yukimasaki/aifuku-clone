import { IsEmail, IsNotEmpty, Matches, MinLength, Validate } from "class-validator"
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'notContains', async: false })
class NotContainsValidator implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    const regex = /[^a-zA-Z0-9\-#_@$%]/;
    return !regex.test(value);
  }

  defaultMessage(): string {
    return '$property contains characters that cannot be used.';
  }
}

export class LoginFormValidator {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @Validate(NotContainsValidator)
  @Matches(/[a-z]/)
  @Matches(/[A-Z]/)
  @Matches(/[0-9]/)
  @Matches(/[\-#_@$%]/)
  @MinLength(8)
  password!: string;
}
