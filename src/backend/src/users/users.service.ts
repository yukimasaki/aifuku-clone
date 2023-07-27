import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { PaginatorService } from '../common/paginator/paginator.service';
import { PaginateOptions, PaginateOutputs } from '../common/paginator/paginator.entity';
import { CreateUserDto, UserResponse } from './user.entity';
import * as bcrypt from 'bcrypt';
import { getRandomString } from 'src/common/utils/random-string';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginator: PaginatorService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, displayName, tenantName } = createUserDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const uid = getRandomString(6);

    return await this.prisma.$transaction(async (tx) => {
      // 1. テナントを作成
      const createTenantData = {
        uid,
        tenantName,
      }
      const tenant = await tx.tenant.create({ data: createTenantData });

      // 2. ユーザを作成
      const createUserData = {
        email,
        hashedPassword,
        displayName,
        tenantId: tenant.id,
      }

      // 一連のトランザクションで想定されるエラーは、email重複による一意性制約エラーしかないはず
      try {
        const user = await tx.user.create({ data: createUserData });
        // 3. 成功すればuserを返却
        return user;
      } catch (error) {
        throw new ConflictException(`${email}は既に存在します`);
      }
    });
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
