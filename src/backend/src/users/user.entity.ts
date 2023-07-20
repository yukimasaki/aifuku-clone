import { IsEmail, IsInt, IsPositive, IsString, Length, MaxLength } from "class-validator";

export class CreateUserDto {
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

export class UpdateUserDto {}

export class UserResponse extends CreateUserDto {
  @IsInt()
  @IsPositive()
  id!: number;
}
