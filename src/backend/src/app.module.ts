import { Module } from '@nestjs/common';
import { ProfilesModule } from './profiles/profiles.module';
import { PrismaService } from './common/prisma/prisma.service';
import { PaginatorService } from './common/paginator/paginator.service';

@Module({
  imports: [ProfilesModule],
  providers: [PrismaService, PaginatorService],
})
export class AppModule {}
