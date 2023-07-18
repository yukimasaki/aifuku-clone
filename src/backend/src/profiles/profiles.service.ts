import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { paginate, PaginateOutputs } from '../prisma/paginate'
import { ProfileResponse } from './entities/profile.entity';

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
    page: string,
    perPage: string,
  ): Promise<PaginateOutputs<ProfileResponse[]>> {
    const numPage = parseInt(page);
    const numPerPage = parseInt(perPage);

    return paginate({
      page: numPage,
      perPage: numPerPage,
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
