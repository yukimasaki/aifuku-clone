import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../common/prisma/prisma.service';
import { PaginatorService } from '../common/paginator/paginator.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, PaginatorService]
})
export class UsersModule {}
