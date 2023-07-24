import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PrismaService } from './common/prisma/prisma.service';
import { PaginatorService } from './common/paginator/paginator.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { Auth0usersController } from './auth0users/auth0users.controller';
import { Auth0usersController } from './users/auth0users/auth0users.controller';
import { Auth0Controller } from './users/auth0/auth0.controller';
import { Auth0Module } from './users/auth0/auth0.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    AuthModule,
    Auth0Module,
  ],
  providers: [PrismaService, PaginatorService, JwtService, AuthService],
  controllers: [Auth0usersController, Auth0Controller],
})
export class AppModule {}
