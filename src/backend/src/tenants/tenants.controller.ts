import { Body, Controller, Post } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './tenant.entity';

@Controller()
export class TenantsController {
  constructor(
    private readonly tenantsService: TenantsService
  ) {}

  @Post('tenants')
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

}
