import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PrismaService } from './common/prisma/prisma.service';
import { PaginatorService } from './common/paginator/paginator.service';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    AuthModule,
  ],
  providers: [PrismaService, PaginatorService, AuthService],
})
export class AppModule {}
