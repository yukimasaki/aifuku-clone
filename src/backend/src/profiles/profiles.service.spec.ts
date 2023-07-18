import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesService } from './profiles.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProfilesService', () => {
  let service: ProfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, ProfilesService],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('ユーザを1レコード取得', async () => {
    const uid = 'bXejERn6lgdWEZniPU3HNoRWPSD3';
    const profile = await service.findOne(uid);
    expect(profile).toEqual({
      id: 1,
      uid,
      displayName: 'Admin',
      email: 'admin@example.com',
      tenantId: 1,
    });
  });
});
