import { Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Profile } from '@prisma/client';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createProfileDto: CreateProfileDto) {
    return 'This action adds a new profile';
  }

  findAll(): Promise<Profile[]> {
    return this.prisma.profile.findMany();
  }

  findOne(uid: string): Promise<Profile> {
    return this.prisma.profile.findUnique({
      where: {
        uid,
      },
    });
  }

  findByPage(
    page: string,
    perPage: string,
  ): Promise<Profile[]> {
    return this.prisma.profile.findMany({
      skip: parseInt(perPage),
      take: parseInt(page),
    });
  }

  update(uid: string, updateProfileDto: UpdateProfileDto) {
    return `This action updates a #${uid} profile`;
  }

  remove(uid: string) {
    return `This action removes a #${uid} profile`;
  }
}
