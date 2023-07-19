import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../prisma/paginator.service'
import { PaginateOutputs, PaginateOptions } from '../prisma/paginator.entity'
import { ProfileResponse } from './profile.entity';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

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
    return paginate({
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
