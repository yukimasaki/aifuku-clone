import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { UserJwtPayload } from 'src/users/user.entity';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthenticatedGuard } from './authenticated.guard';

@Controller('auth')
export class AuthController {
  constructor(
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signIn(
    @Request() req: { user: UserJwtPayload }
  ): Promise<UserJwtPayload> {
    const user = req.user;
    return user;
  }

  @UseGuards(AuthenticatedGuard)
  @Get('private')
  async private(
    @Request() req: any
  ) {
    return req.user;
  }
}
