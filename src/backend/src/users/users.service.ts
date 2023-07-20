import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { PaginatorService } from '../common/paginator/paginator.service';
import { PaginateOptions, PaginateOutputs } from '../common/paginator/paginator.entity';
import { CreateUserDto, UserResponse } from './user.entity';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginator: PaginatorService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, displayName, tenantId } = createUserDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const data = {
      email,
      hashedPassword,
      displayName,
      tenantId,
    }

    return await this.prisma.user.create({ data });
  }

  async findOne(id: number): Promise<UserResponse | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  }

  findByPage(
    paginateOptions: PaginateOptions,
  ): Promise<PaginateOutputs<UserResponse[]>> {
    const users = this.paginator.paginator({
      paginateOptions,
      queryFn: (args) =>
        this.prisma.user.findMany({ ...args }),
      countFn: async () => this.prisma.user.count(),
    });
    return users
  }

  // update(uid: string, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${uid} user`;
  // }

  // remove(uid: string) {
  //   return `This action removes a #${uid} user`;
  // }
}
