import { IsInt, IsDefined, IsString } from "class-validator";
import { User } from "./";

export class Tenant {
    @IsDefined()
    @IsInt()
    id!: number;

    @IsDefined()
    @IsString()
    uid!: string;

    @IsDefined()
    @IsString()
    tenantName!: string;

    @IsDefined()
    users!: User[];
}
