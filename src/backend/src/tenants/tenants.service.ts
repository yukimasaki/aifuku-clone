import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateTenantDto } from './tenant.entity';
import { getRandomString } from 'src/common/utils/random-string';

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create (createTenantDto: CreateTenantDto) {
    const { tenantName } = createTenantDto;

    const uid = getRandomString(6);

    const data = {
      tenantName,
      uid,
    }

    return await this.prisma.tenant.create({ data });
  }
}
