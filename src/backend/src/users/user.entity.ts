import { IsEmail, IsInt, IsPositive, IsString, IsStrongPassword, MaxLength } from "class-validator";

export class CreateUserDto {
  @IsString()
  @IsEmail()
  email!: string;

  @IsString()
  @IsStrongPassword()
  password!: string;

  @IsString()
  @MaxLength(255)
  displayName!: string;

  @IsInt()
  @IsPositive()
  tenantId!: number;
}

export class UpdateUserDto {}

export class UserResponse {
  @IsInt()
  @IsPositive()
  id!: number;

  @IsString()
  @IsEmail()
  email!: string;

  @IsString()
  hashedPassword!: string;

  @IsString()
  @MaxLength(255)
  displayName!: string;

  @IsInt()
  @IsPositive()
  tenantId!: number;
}
