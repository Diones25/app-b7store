import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { hash, compare } from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { v4 } from 'uuid';

@Injectable()
export class UserService {

  constructor(
    private readonly prisma: PrismaService
  ) {}
  
  private readonly logger = new Logger(UserService.name);

  async createUser(createUserDto: CreateUserDto) {
    const emailExists = await this.prisma.user.findUnique({
      where: {
        email: createUserDto.email
      }
    });

    if (emailExists) {
      this.logger.error('E-mail ja cadastrado');
      throw new BadRequestException('E-mail ja cadastrado');
    }

    const hashPassword = await hash(createUserDto.password, 10);
    
    this.logger.log('Criando um novo usuário');
    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email.toLowerCase(),
        password: hashPassword
      }
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginUserDto.email.toLowerCase()
      }
    });

    if (!user) {
      this.logger.error('Acesso negado');
      throw new UnauthorizedException('Acesso negado');
    }

    const validPassword = await compare(loginUserDto.password, user.password);

    if (!validPassword) {
      this.logger.error('Acesso negado');
      throw new UnauthorizedException('Acesso negado');
    }

    const token = v4();
    await this.prisma.user.update({
      where: { id: user.id },
      data: { token }
    });

    return { token };
  }
}
