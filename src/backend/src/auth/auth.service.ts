import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { UserCredentialsDto } from './auth.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserJwtPayload } from 'src/users/user.entity';

console.log(`ここはauth.serviceです@top`);

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: UserCredentialsDto['email'],
    password: UserCredentialsDto['password'],
  ): Promise<UserJwtPayload | null> {
    console.log(`bbb`)
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (
      user &&
      await bcrypt.compare(password, user.hashedPassword)
    ) {
      const { hashedPassword, ...userWithoutHashedPassword } = user;
      console.log(`====================================`);
      console.log(`userWithoutHashedPassword:`);
      console.log(userWithoutHashedPassword);

      return userWithoutHashedPassword;
    }

    return null
  }

  async createJwt(
    user: UserJwtPayload
  ): Promise<{ accessToken: string }> {
    console.log(`user:`);
    console.log(user);

    const payload = { id: user.id, email: user.email }
    const accessToken = this.jwtService.sign(payload);
    return { accessToken }
  }
}