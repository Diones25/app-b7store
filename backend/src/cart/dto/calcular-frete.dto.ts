import { IsNotEmpty, IsNumber, IsPositive, IsString, Length } from 'class-validator';

export class FromDto {
  @IsString()
  @IsNotEmpty()
  @Length(8, 8, { message: 'O CEP de origem deve ter 8 dígitos' })
  postal_code: string;
}

export class ToDto {
  @IsString()
  @IsNotEmpty()
  @Length(8, 8, { message: 'O CEP de destino deve ter 8 dígitos' })
  postal_code: string;
}

export class PackageDto {
  @IsNumber()
  @IsPositive()
  height: number;

  @IsNumber()
  @IsPositive()
  width: number;

  @IsNumber()
  @IsPositive()
  length: number;

  @IsNumber()
  @IsPositive()
  weight: number;
}

export class CalcularFreteDto {
  @IsNotEmpty()
  from: FromDto;

  @IsNotEmpty()
  to: ToDto;

  @IsNotEmpty()
  package: PackageDto;
}
