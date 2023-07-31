import { IsEmail, IsNotEmpty, Matches, MinLength, Validate } from "class-validator"
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { VALIDATION_ERRORS } from "src/app/common/errors/error.constants";

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
  @IsNotEmpty({ message: VALIDATION_ERRORS.REQUIRED })
  @IsEmail({}, { message: VALIDATION_ERRORS.INVALID_EMAIL })
  email!: string;

  @IsNotEmpty({ message: VALIDATION_ERRORS.REQUIRED })
  @Validate(NotContainsValidator, { message: VALIDATION_ERRORS.INVALID_PASSWORD_UNUSABLE_CHARACTER })
  @Matches(/[a-z]/, { message: VALIDATION_ERRORS.INVALID_PASSWORD_LOWER_LETTER_REQUIRED })
  @Matches(/[A-Z]/, { message: VALIDATION_ERRORS.INVALID_PASSWORD_UPPER_LETTER_REQUIRED })
  @Matches(/[0-9]/, { message: VALIDATION_ERRORS.INVALID_PASSWORD_NUMBER_REQUIRED })
  @Matches(/[\-#_@$%]/, { message: VALIDATION_ERRORS.INVALID_PASSWORD_SPECIAL_CHARACTER_REQUIRED })
  @MinLength(8, { message: VALIDATION_ERRORS.INVALID_PASSWORD_NOT_ENOUGH_LENGTH })
  password!: string;
}
