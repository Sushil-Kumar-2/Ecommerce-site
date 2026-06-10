import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

import type { GoogleProfilePayload } from '../interfaces/google-profile.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID', '').trim();
    const clientSecret = configService
      .get<string>('GOOGLE_CLIENT_SECRET', '')
      .trim();
    const callbackURL =
      configService
        .get<string>(
          'GOOGLE_CALLBACK_URL',
          'http://localhost:3000/auth/google/callback',
        )
        .trim() || 'http://localhost:3000/auth/google/callback';

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      done(
        new UnauthorizedException('Google account does not provide an email'),
        false,
      );
      return;
    }

    const displayName =
      profile.displayName?.trim() ||
      [profile.name?.givenName, profile.name?.familyName]
        .filter(Boolean)
        .join(' ')
        .trim() ||
      email.split('@')[0];

    const user: GoogleProfilePayload = {
      googleId: profile.id,
      email: email.toLowerCase(),
      name: displayName,
      picture: profile.photos?.[0]?.value,
    };

    done(null, user);
  }
}
