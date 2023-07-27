import { IsString, IsNotEmpty, IsEmail } from "class-validator";

export class UserCredentialsDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsString()
  password!: string
}
