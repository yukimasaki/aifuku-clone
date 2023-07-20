import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { PaginatorService } from '../common/paginator/paginator.service';
import { PaginateOptions, PaginateOutputs } from '../common/paginator/paginator.entity';
import { ProfileResponse } from './profile.entity';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginator: PaginatorService,
  ) {}

  // create(createProfileDto: CreateProfileDto) {
  //   return 'This action adds a new profile';
  // }

  findOne(uid: string): Promise<ProfileResponse | null> {
    return this.prisma.profile.findUnique({
      where: {
        uid,
      },
    });
  }

  findByPage(
    paginateOptions: PaginateOptions,
  ): Promise<PaginateOutputs<ProfileResponse[]>> {
    return this.paginator.paginator({
      paginateOptions,
      queryFn: (args) =>
        this.prisma.profile.findMany({ ...args }),
      countFn: async () => this.prisma.profile.count(),
    });
  }

  // update(uid: string, updateProfileDto: UpdateProfileDto) {
  //   return `This action updates a #${uid} profile`;
  // }

  // remove(uid: string) {
  //   return `This action removes a #${uid} profile`;
  // }
}
