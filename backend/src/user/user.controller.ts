import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/guards/auth.guard';


@Controller('user')
export class UserController {

  constructor(private readonly userService: UserService) { }

  @UseGuards(AuthGuard)
  @Get('addresses')
  async userAdresses() {
    return "OK";
  }
}
