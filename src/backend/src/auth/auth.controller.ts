import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { UserJwtPayload } from 'src/users/bak/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('signin')
  async signIn(
    @Request() req: { user: UserJwtPayload }
  ): Promise<{ accessToken: string }> {
    const user = req.user;
    return this.authService.createJwt(user);
  }
}
