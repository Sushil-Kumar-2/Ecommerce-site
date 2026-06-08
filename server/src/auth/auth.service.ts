import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  
  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(
      loginDto.email,
    );
  
    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }
  
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
  
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException(
        'Your account is not active. Please contact support.',
      );
    }
  
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };
  
    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}