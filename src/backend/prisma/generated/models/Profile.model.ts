import { IsInt, IsDefined, IsString } from "class-validator";
import { Tenant } from "./";

export class Profile {
    @IsDefined()
    @IsInt()
    id!: number;

    @IsDefined()
    @IsString()
    uid!: string;

    @IsDefined()
    @IsString()
    email!: string;

    @IsDefined()
    @IsString()
    displayName!: string;

    @IsDefined()
    tenant!: Tenant;

    @IsDefined()
    @IsInt()
    tenantId!: number;
}
