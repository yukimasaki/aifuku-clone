import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private authService: AuthService) {
    super();
  }

  serializeUser(
    user: any,
    done: (err: Error | null, id: number) => void
  ): void {
    done(null, user.id);
  }

  async deserializeUser(
    id: number,
    done: (err: Error | null, user: any) => void,
  ): Promise<void> {
    const user = await this.authService.getAuthenticatedUser(id);
    done(null, user);
  }
}
