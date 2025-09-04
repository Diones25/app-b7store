import { UnauthorizedException } from "@nestjs/common";

export const authorizationToLoginPayload = (authorization: string) => {
  if (!authorization) {
    throw new UnauthorizedException('Cabeçalho Authorization não encontrado');
  }

  const authorizationSplited = authorization.split('.');

  if (authorizationSplited.length < 3 || !authorizationSplited[1]) {
    throw new UnauthorizedException('Token inválido');
  }

  try {
    return JSON.parse(Buffer.from(authorizationSplited[1], 'base64').toString('ascii'));
  } catch (e) {
    throw new UnauthorizedException('Erro ao decodificar o token');
  }
}