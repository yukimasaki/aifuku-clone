import { Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  create(createProfileDto: CreateProfileDto) {
    return 'This action adds a new profile';
  }

  findAll() {
    return `This action returns all profiles`;
  }

  findOne(uid: string) {
    return `This action returns a #${uid} profile`;
  }

  update(uid: string, updateProfileDto: UpdateProfileDto) {
    return `This action updates a #${uid} profile`;
  }

  remove(uid: string) {
    return `This action removes a #${uid} profile`;
  }
}
