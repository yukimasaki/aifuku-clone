import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesService } from './profiles.service';
import { PrismaService } from '../prisma/prisma.service';
import { Profile } from '@prisma/client';

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

  it('全ユーザ取得', async () => {
    const profiles = await service.findAll();
    expect(Array.isArray(profiles)).toBe(true);
    expect(profiles.every((profile: Profile) => typeof profile.id === 'number')).toBe(true);
    expect(profiles.every((profile: Profile) => typeof profile.uid === 'string')).toBe(true);
    expect(profiles.every((profile: Profile) => typeof profile.email === 'string')).toBe(true);
    expect(profiles.every((profile: Profile) => typeof profile.displayName === 'string')).toBe(true);
    expect(profiles.every((profile: Profile) => typeof profile.tenantId === 'number')).toBe(true);
  });
});
