import { IsEmail, IsInt, IsPositive, IsString, Length, MaxLength } from "class-validator";

export class CreateProfileDto {
  @IsString()
  @Length(28)
  uid!: string;

  @IsString()
  @IsEmail()
  email!: string;

  @IsString()
  @MaxLength(255)
  displayName!: string;

  @IsInt()
  @IsPositive()
  tenantId!: number;
}

export class UpdateProfileDto {}

export class ProfileResponse extends CreateProfileDto {
  @IsInt()
  @IsPositive()
  id!: number;
}
