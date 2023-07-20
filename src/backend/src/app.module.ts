import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PrismaService } from './common/prisma/prisma.service';
import { PaginatorService } from './common/paginator/paginator.service';

@Module({
  imports: [UsersModule],
  providers: [PrismaService, PaginatorService],
})
export class AppModule {}
