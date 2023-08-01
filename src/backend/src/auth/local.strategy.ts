import { Strategy as BaseLocalStrategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserCredentialsDto } from './auth.entity';
import { UserJwtPayload } from 'src/users/user.entity';

/**
 * @description emailとpasswordを使った認証処理を行うクラス
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(BaseLocalStrategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  // passport-localは、デフォルトで email と password をパラメーターで受け取る
  async validate(
    email: UserCredentialsDto['email'],
    password: UserCredentialsDto['password'],
  ): Promise<UserJwtPayload | null> {
    // 認証して結果を受け取る
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException(
        'ユーザ名またはパスワードを確認してください',
      );
    }

    return user;
  }
}
