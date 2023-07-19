import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, Max, Min } from "class-validator";

export class FindByPageQueries {
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(25)
  perPage: number = 10;
}

export type PaginateOptions = {
  page: number
  perPage: number
}

export type PaginateInputs<Items> = {
  paginateOptions: PaginateOptions
  queryFn: (args: { skip: number; take: number }) => Promise<Items>
  countFn: () => Promise<number>
}

export type PaginateOutputs<Items> = {
  items: Items
  count: number
  pageCount: number
  links: {
    id: number,
    label: string,
    url: string,
    active: boolean,
  }[]
}

export type PageContinuty = {
  left: boolean
  right: boolean
}

export type PagePosition = 'start' | 'end' | 'middle';

export type PageInfo = {
  page: number
  pageCount: number
  pageRange: number
  perPage: number
  baseUrl: string
}

export type PageLabel = {
  id: number
  label: string
  url: string
  active: boolean
}

export type DuplicatedLabel = {
  description: string
  value: string
  url: string
  active: boolean
}

export type CreationConditions = {
  length: number
  loopStart: number
}
