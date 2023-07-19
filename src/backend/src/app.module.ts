import { Module } from '@nestjs/common';
import { ProfilesModule } from './profiles/profiles.module';
import { PrismaService } from './common/prisma/prisma.service';

@Module({
  imports: [ProfilesModule],
  providers: [PrismaService],
})
export class AppModule {}
