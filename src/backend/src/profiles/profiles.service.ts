import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { PaginatorService } from '../common/paginator/paginator.service';
import { PaginateOptions, PaginateOutputs } from '../common/paginator/paginator.entity';
import { CreateProfileDto, ProfileResponse } from './profile.entity';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginator: PaginatorService,
  ) {}

  async create(createProfileDto: CreateProfileDto) {
    return await this.prisma.profile.create({ data: createProfileDto });
  }

  async findOne(uid: string): Promise<ProfileResponse | null> {
    const profile = await this.prisma.profile.findUnique({
      where: {
        uid,
      },
    });
    return profile;
  }

  findByPage(
    paginateOptions: PaginateOptions,
  ): Promise<PaginateOutputs<ProfileResponse[]>> {
    const profiles = this.paginator.paginator({
      paginateOptions,
      queryFn: (args) =>
        this.prisma.profile.findMany({ ...args }),
      countFn: async () => this.prisma.profile.count(),
    });
    return profiles
  }

  // update(uid: string, updateProfileDto: UpdateProfileDto) {
  //   return `This action updates a #${uid} profile`;
  // }

  // remove(uid: string) {
  //   return `This action removes a #${uid} profile`;
  // }
}
