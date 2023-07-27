import { OmitType } from "@nestjs/mapped-types";
import { IsInt, IsPositive, IsString, Length, MaxLength } from "class-validator";

export class Tenant {
  @IsInt()
  @IsPositive()
  id!: number;

  @IsString()
  @Length(6)
  uid!: string

  @IsString()
  @MaxLength(255)
  tenantName!: string;
}

export class CreateTenantDto extends OmitType(Tenant, ['id', 'uid']) {}

export class TenantResponse extends Tenant {}
