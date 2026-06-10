import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class NodemailerService {
  private readonly logger = new Logger(NodemailerService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    const user = this.configService.get<string>('EMAIL_USER');
    const pass = this.normalizeAppPassword(
      this.configService.get<string>('EMAIL_PASS'),
    );
    const host =
      this.configService.get<string>('EMAIL_HOST') ?? 'smtp.gmail.com';
    const port = Number(this.configService.get<string>('EMAIL_PORT') ?? 587);
    const secure =
      this.configService.get<string>('EMAIL_SECURE') === 'true' || port === 465;

    this.from =
      this.configService.get<string>('EMAIL_FROM') ??
      user ??
      'noreply@localhost';

    if (!user || !pass) {
      this.transporter = null;
      this.logger.warn(
        'EMAIL_USER or EMAIL_PASS is not set — emails will not be sent',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  async send(params: SendEmailParams): Promise<void> {
    if (!this.transporter) {
      this.logger.debug(
        `[Email skipped] to=${params.to} subject="${params.subject}"`,
      );
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });

      this.logger.debug(
        `Email queued via SMTP: messageId=${info.messageId ?? 'n/a'}`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown email error';
      this.logger.error(`Failed to send email to ${params.to}: ${message}`);
      throw new Error(`Email send failed: ${message}`);
    }
  }

  private normalizeAppPassword(password?: string): string | undefined {
    if (!password) {
      return undefined;
    }

    // Gmail app passwords are often copied with spaces (e.g. "abcd efgh ijkl mnop").
    return password.replace(/\s+/g, '');
  }
}
