import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { UserCredentialsDto } from './auth.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(
    userCredentialsDto: UserCredentialsDto
  ): Promise<{ accessToken: string }> {
    const { email, password } = userCredentialsDto;
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (
      user &&
      await bcrypt.compare(password, user.hashedPassword)
    ) {
      const payload = { id: user.id, email: user.email }
      const accessToken = this.jwtService.sign(payload);
      return { accessToken }
    }
    throw new UnauthorizedException(
      'ユーザ名またはパスワードを確認してください',
    )
  }
}
