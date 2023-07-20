import { OmitType } from "@nestjs/mapped-types";
import { IsEmail, IsInt, IsPositive, IsString, IsStrongPassword, MaxLength } from "class-validator";

export class User {
  @IsInt()
  @IsPositive()
  id!: number;

  @IsString()
  @IsEmail()
  email!: string

  @IsString()
  hashedPassword!: string;

  @IsString()
  @MaxLength(255)
  displayName!: string;

  @IsInt()
  @IsPositive()
  tenantId!: number;
}

export class CreateUserDto extends OmitType(User, ['id', 'hashedPassword']) {
  @IsString()
  @IsStrongPassword()
  password!: string
}

export class UpdateUserDto {}

export class UserResponse extends User {}

export class UserJwtPayload extends OmitType(User, ['hashedPassword']) {}
