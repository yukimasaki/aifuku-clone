import { IsInt, IsDefined, IsString } from "class-validator";
import { Profile } from "./";

export class Tenant {
    @IsDefined()
    @IsInt()
    id!: number;

    @IsDefined()
    @IsString()
    displayName!: string;

    @IsDefined()
    profiles!: Profile[];
}
