import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PrismaService } from './common/prisma/prisma.service';
import { PaginatorService } from './common/paginator/paginator.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
  ],
  providers: [PrismaService, PaginatorService],
})
export class AppModule {}
