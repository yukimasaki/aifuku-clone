import { OmitType } from "@nestjs/mapped-types";
import { Role } from "@prisma/client";
import { IsEmail, IsIn, IsInt, IsPositive, IsString, MaxLength } from "class-validator";

export class User {
  @IsInt()
  @IsPositive()
  id!: number;

  @IsString()
  @IsEmail()
  email!: string

  @IsString()
  @MaxLength(255)
  displayName!: string;

  @IsIn(Object.keys(Role))
  role!: Role;

  @IsInt()
  @IsPositive()
  tenantId!: number;
}

export class CreateUserDto extends OmitType(User, ['id']) {}

export class UserResponse extends User {}
