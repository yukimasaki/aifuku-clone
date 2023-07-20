import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { PrismaService } from '../common/prisma/prisma.service';
import { PaginatorService } from '../common/paginator/paginator.service';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService, PrismaService, PaginatorService]
})
export class ProfilesModule {}
