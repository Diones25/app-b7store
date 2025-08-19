import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import * as bcrypt from "bcrypt";
import { AuthRegisterDTO } from './dto/auth-register.dto';

@Injectable()
export class AuthService {

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly prismaService: PrismaService
  ) { }
  
  async createToken(user: User) {
    return {
      accessToken: this.jwtService.sign({
        id: user.id,
        name: user.name,
        email: user.email,
      }, {
        expiresIn: '7d',
        subject: user.id.toString()
      })
    }
  }
  
  async checkToken(token: string) {
    try {
      const data = this.jwtService.verify(token);
      return data;
    } catch (error) {
      throw new BadRequestException(JSON.stringify(error.message));
    }
  }

  isValidToken(token: string) {
    try {
      this.checkToken(token);
      return true;
    } catch (error) {
      return false;
    }
  }

  async login(email: string, password: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: email
      }
    });

    if (!user) {
      throw new UnauthorizedException('E-mail e/ou senha inválidos');
    }

    const IsPasswordValid = await bcrypt.compare(password, user.password);

    if (!IsPasswordValid) {
      throw new UnauthorizedException('E-mail e/ou senha inválidos');
    }

    return this.createToken(user);
  }

  async register(data: AuthRegisterDTO) {
    const createdUser = await this.userService.create(data);
    const user = await this.prismaService.user.findUnique({
      where: { id: createdUser.id }
    });
    if (!user) {
      throw new BadRequestException('Erro ao criar usuário');
    }
    return this.createToken(user);  
  }
}
