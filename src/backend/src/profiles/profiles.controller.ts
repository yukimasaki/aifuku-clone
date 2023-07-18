import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  create(@Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.create(createProfileDto);
  }

  @Get()
  findAll() {
    return this.profilesService.findAll();
  }

  @Get(':uid')
  findOne(@Param('uid') uid: string) {
    return this.profilesService.findOne(uid);
  }

  @Patch(':uid')
  update(@Param('uid') uid: string, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profilesService.update(uid, updateProfileDto);
  }

  @Delete(':uid')
  remove(@Param('uid') uid: string) {
    return this.profilesService.remove(uid);
  }
}
