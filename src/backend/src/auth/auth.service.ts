import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { UserCredentialsDto } from './auth.entity';
import * as bcrypt from 'bcrypt';
import { UserJwtPayload } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async validateUser(
    email: UserCredentialsDto['email'],
    password: UserCredentialsDto['password'],
  ): Promise<UserJwtPayload | null> {
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (
      user &&
      await bcrypt.compare(password, user.hashedPassword)
    ) {
      const { hashedPassword, ...userWithoutHashedPassword } = user;
      return userWithoutHashedPassword;
    }

    return null
  }

  async getAuthenticatedUser(id: number): Promise<any> {
    const user = await this.usersService.findOne(id);

    if (user) {
      const { hashedPassword, ...result } = user;
      return result;
    }

    return null;
  }
}
