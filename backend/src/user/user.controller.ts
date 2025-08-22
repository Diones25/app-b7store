import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreateAdresseUserDto } from './dto/create-adress-user.dto';
import { UserId } from '../decorators/user-id-decorator';


@Controller('user')
export class UserController {

  constructor(private readonly userService: UserService) { }

  @UseGuards(AuthGuard)
  @Get('addresses')
  async findAdresses(@UserId() userId: number) {
    return this.userService.findAdresses(userId);
  }


  @UseGuards(AuthGuard)
  @Post('addresses')
  async createAdresses(@UserId() userId: number, @Body() body: CreateAdresseUserDto) {
    return this.userService.createAdress(userId, body);
  }
}
