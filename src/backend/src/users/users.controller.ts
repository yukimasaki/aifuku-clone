import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { FindByPageQueries, PaginateOptions } from '../common/paginator/paginator.entity';
import { CreateUserDto } from './user.entity';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('users')
  createOwner(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('users')
  findByPage(
    @Query() queries: FindByPageQueries,
    @Req() req: any,
  ) {
    const paginateOptions: PaginateOptions = {
      page: queries.page,
      perPage: queries.perPage,
      baseUrl: req.path,
    }
    return this.usersService.findByPage(paginateOptions);
  }

  @Get('users/:id')
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }

  // @Patch('users/:uid')
  // update(@Param('uid') uid: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(uid, updateUserDto);
  // }

  // @Delete('users/:uid')
  // remove(@Param('uid') uid: string) {
  //   return this.usersService.remove(uid);
  // }
}
