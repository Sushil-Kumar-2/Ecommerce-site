import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ResendService } from './resend.service';
import { TemplateService } from './template.service';

@Module({
  providers: [EmailService, ResendService, TemplateService],
  exports: [EmailService],
})
export class EmailModule {}
