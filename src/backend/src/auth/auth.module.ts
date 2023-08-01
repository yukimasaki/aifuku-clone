import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';
import { UsersService } from 'src/users/users.service';
import { PaginatorService } from 'src/common/paginator/paginator.service';

@Module({
  imports: [
    PassportModule.register({ session: true }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, LocalStrategy, SessionSerializer, UsersService, PaginatorService],
})
export class AuthModule {}
