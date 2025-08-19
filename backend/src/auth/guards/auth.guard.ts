import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { UserService } from "../../user/user.service";

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest();
    const { authorization } = request.headers;


    try {
      const data = await this.authService.checkToken((authorization ?? '').split(' ')[1]);
      request.tokenPayload = data;

      request.user = await this.userService.findOne(data.id);


      return true
    } catch (error) {
      return false;
    }
  }
}