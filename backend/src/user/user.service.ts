import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from "bcrypt";
import { CreateAdresseUserDto } from './dto/create-adress-user.dto';

@Injectable()
export class UserService {

  constructor(
    private readonly prisma: PrismaService
  ) {}
  
  private readonly logger = new Logger(UserService.name);

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: createUserDto.email
      }
    });

    if (existingUser) {
      this.logger.error('E-mail ja cadastrado');
      throw new BadRequestException('E-mail ja cadastrado');
    }

    const hashPassword = await bcrypt.hash(createUserDto.password, 10);
    
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

  async findOne(id: number) {
    await this.exists(id);

    this.logger.log("Listando um usuário");
    return this.prisma.user.findUnique({
      where: {
        id
      }
    });
  }

  async exists(id: number) {
    const user = await this.prisma.user.count({
      where: {
        id
      }
    });

    if (!user) {
      this.logger.log("Aconteceu uma exceção");
      throw new NotFoundException(`O usuário ${id} não existe`);
    }
  }

  async createAdress(userId: number, address: CreateAdresseUserDto) {

    if (!userId) {
      this.logger.error(`Acesso não autorizado`);
      throw new UnauthorizedException(`Acesso não autorizado`);
    }

    this.logger.log("Criando um novo endereço para o usuário");

    return this.prisma.userAddress.create({
      data: {
        ...address,
        userId
      }
    });               
  }

  async findAdresses(userId: number) {
    if (!userId) {
      this.logger.error(`Acesso não autorizado`);
      throw new UnauthorizedException(`Acesso não autorizado`);
    }

    this.logger.log("Listando endereços do usuário");

    return this.prisma.userAddress.findMany({
      where: {
        userId
      },
      select: {
        id: true,
        zipcode: true,
        street: true,
        number: true,
        city: true,
        state: true,
        country: true,
        complement: true
      }
    });
  }

  async getAddressById(userId: number, addressId: number) {
    this.logger.log("Listando endereços do usuário");

    return this.prisma.userAddress.findFirst({
      where: {
        id: addressId,
        userId
      },
      select: {
        id: true,
        zipcode: true,
        street: true,
        number: true,
        city: true,
        state: true,
        country: true,
        complement: true
      }
    });
  }
}
