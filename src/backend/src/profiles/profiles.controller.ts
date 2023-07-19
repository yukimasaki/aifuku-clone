import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UsePipes } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { FindByPageQueries, PaginateOptions } from '../prisma/paginator.entity';

@Controller('api')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  // @Post('profiles')
  // create(@Body() createProfileDto: CreateProfileDto) {
  //   return this.profilesService.create(createProfileDto);
  // }

  @Get('profiles')
  findByPage(
    @Query() queries: FindByPageQueries,
  ) {

    console.log(`======================================`);
    console.log(`queries:`);
    console.log(queries);
    console.log(typeof(queries.page));

    const paginateOptions: PaginateOptions = {
      page: queries.page,
      perPage: queries.perPage,
    }

    console.log(`======================================`);
    console.log(`paginateOptions:`);
    console.log(paginateOptions);
    console.log(typeof(paginateOptions.page));

    return this.profilesService.findByPage(paginateOptions);
  }

  @Get('profiles/:uid')
  findOne(@Param('uid') uid: string) {
    return this.profilesService.findOne(uid);
  }

  // @Patch('profiles/:uid')
  // update(@Param('uid') uid: string, @Body() updateProfileDto: UpdateProfileDto) {
  //   return this.profilesService.update(uid, updateProfileDto);
  // }

  // @Delete('profiles/:uid')
  // remove(@Param('uid') uid: string) {
  //   return this.profilesService.remove(uid);
  // }
}
