import { Body, Controller, Post } from '@nestjs/common';
import { UserCredentialsDto } from './auth.entity';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('signin')
  async signIn(
    @Body() userCredentialsDto: UserCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(userCredentialsDto);
  }
}
