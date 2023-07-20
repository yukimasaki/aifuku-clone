import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../common/prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('ユーザを1レコード取得', async () => {
    const id = 4;
    const user = await service.findOne(id);
    expect(user).toEqual({
      id: 4,
      displayName: 'Admin',
      email: 'admin@example.com',
      tenantId: 1,
    });
  });
});
