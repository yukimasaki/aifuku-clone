import { IsInt, IsDefined, IsString } from "class-validator";
import { Tenant } from "./";

export class User {
    @IsDefined()
    @IsInt()
    id!: number;

    @IsDefined()
    @IsString()
    email!: string;

    @IsDefined()
    @IsString()
    hashedPassword!: string;

    @IsDefined()
    @IsString()
    displayName!: string;

    @IsDefined()
    tenant!: Tenant;

    @IsDefined()
    @IsInt()
    tenantId!: number;
}
