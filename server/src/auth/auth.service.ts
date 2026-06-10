import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { UserDocument } from '../users/schemas/user.schema';
import type { GoogleProfilePayload } from './interfaces/google-profile.interface';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { Response, Request } from 'express';

import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './schemas/refresh-token.schema';

const REFRESH_COOKIE = 'refreshToken';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  async login(loginDto: LoginDto, res: Response) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.password) {
      throw new UnauthorizedException(
        'This account uses Google sign-in. Please continue with Google.',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    this.assertUserCanLogin(user);

    return this.issueAuthTokens(user, res);
  }

  async googleCallback(
    googleUser: GoogleProfilePayload,
    res: Response,
  ): Promise<void> {
    const clientUrl = this.configService.get<string>(
      'CLIENT_URL',
      'http://localhost:5173',
    );

    try {
      const user = await this.usersService.findOrCreateGoogleUser(googleUser);
      this.assertUserCanLogin(user);
      await this.issueRefreshToken(user._id.toString(), res);
      res.redirect(`${clientUrl}/auth/google/callback`);
    } catch (error) {
      const message =
        error instanceof UnauthorizedException
          ? this.mapAuthErrorToQuery(error.message)
          : 'google_failed';

      res.redirect(
        `${clientUrl}/auth/login?error=${encodeURIComponent(message)}`,
      );
    }
  }

  async refresh(req: Request, res: Response) {
    const rawToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;

    if (!rawToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const tokenHash = this.hashToken(rawToken);
    const stored = await this.refreshTokenModel.findOne({
      tokenHash,
      revokedAt: { $exists: false },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findOne(stored.userId);

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    stored.revokedAt = new Date();
    await stored.save();

    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    await this.issueRefreshToken(user._id.toString(), res);

    return { accessToken };
  }

  async logout(req: Request, res: Response) {
    const rawToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;

    if (rawToken) {
      const tokenHash = this.hashToken(rawToken);
      await this.refreshTokenModel.updateOne(
        { tokenHash, revokedAt: { $exists: false } },
        { revokedAt: new Date() },
      );
    }

    this.clearRefreshCookie(res);
    return { success: true };
  }

  private assertUserCanLogin(user: UserDocument): void {
    if (user.status === 'pending') {
      throw new UnauthorizedException(
        'Your seller application is under review.',
      );
    }

    if (user.status === 'blocked') {
      throw new UnauthorizedException(
        'Your account has been blocked. Please contact support.',
      );
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException(
        'Your account is not active. Please contact support.',
      );
    }
  }

  private async issueAuthTokens(user: UserDocument, res: Response) {
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    await this.issueRefreshToken(user._id.toString(), res);

    return { accessToken };
  }

  private mapAuthErrorToQuery(message: string): string {
    if (message.includes('seller application')) {
      return 'merchant_pending';
    }

    if (message.includes('blocked')) {
      return 'account_blocked';
    }

    return 'google_failed';
  }

  private async issueRefreshToken(userId: string, res: Response) {
    const rawToken = crypto.randomBytes(48).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES',
      '7d',
    );
    const expiresAt = this.parseExpiry(expiresIn);

    await this.refreshTokenModel.create({
      userId,
      tokenHash,
      expiresAt,
    });

    res.cookie(REFRESH_COOKIE, rawToken, this.getCookieOptions(expiresAt));
  }

  private clearRefreshCookie(res: Response) {
    res.clearCookie(REFRESH_COOKIE, {
      httpOnly: true,
      secure: this.configService.get<string>('COOKIE_SECURE') === 'true',
      sameSite: this.getSameSite(),
      path: '/',
    });
  }

  private getCookieOptions(expiresAt: Date) {
    return {
      httpOnly: true,
      secure: this.configService.get<string>('COOKIE_SECURE') === 'true',
      sameSite: this.getSameSite(),
      expires: expiresAt,
      path: '/',
    } as const;
  }

  private getSameSite(): 'lax' | 'strict' | 'none' {
    const value = this.configService.get<string>('COOKIE_SAME_SITE', 'lax');
    if (value === 'strict' || value === 'none') return value;
    return 'lax';
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseExpiry(duration: string): Date {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const amount = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + amount * (multipliers[unit] ?? multipliers.d));
  }
}
