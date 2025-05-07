import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { jwtDecode } from 'jwt-decode';
import { Request } from 'express';

@Injectable()
export class JwtGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token)
      throw new UnauthorizedException('Missing or invalid authorization token');

    try {
      const payload = jwtDecode(token);
      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token format');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // Check if authorization header exists
    if (!request.headers.authorization) {
      return undefined;
    }

    const [type, token] = request.headers.authorization.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
