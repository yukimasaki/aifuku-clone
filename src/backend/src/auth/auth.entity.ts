import { IsString, IsNotEmpty } from "class-validator";

export class UserCredentialsDto {
  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsString()
  password!: string
}
