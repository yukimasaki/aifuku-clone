import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('api')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post('profiles')
  create(@Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.create(createProfileDto);
  }

  // @Get('profiles')
  // findAll() {
  //   return this.profilesService.findAll();
  // }

  @Get('profiles')
  findByPage(
    @Query('page') page: string,
    @Query('PerPage') perPage: string,
  ) {
    return this.profilesService.findByPage(page, perPage);
  }

  @Get('profiles/:uid')
  findOne(@Param('uid') uid: string) {
    return this.profilesService.findOne(uid);
  }

  @Patch('profiles/:uid')
  update(@Param('uid') uid: string, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profilesService.update(uid, updateProfileDto);
  }

  @Delete('profiles/:uid')
  remove(@Param('uid') uid: string) {
    return this.profilesService.remove(uid);
  }
}
