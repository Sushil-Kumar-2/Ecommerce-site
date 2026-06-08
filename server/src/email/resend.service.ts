import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class ResendService {
  private readonly logger = new Logger(ResendService.name);
  private readonly client: Resend | null;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.from =
      this.configService.get<string>('EMAIL_FROM') ?? 'onboarding@resend.dev';
    this.client = apiKey ? new Resend(apiKey) : null;

    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY is not set — emails will not be sent');
    }
  }

  async send(params: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    if (!this.client) {
      this.logger.debug(
        `[Resend skipped] to=${params.to} subject="${params.subject}"`,
      );
      return;
    }

    const { error } = await this.client.emails.send({
      from: this.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (error) {
      throw new Error(error.message);
    }
  }
}
