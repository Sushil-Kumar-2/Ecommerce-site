import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { NodemailerService } from './nodemailer.service';
import { TemplateService } from './template.service';

@Module({
  providers: [EmailService, NodemailerService, TemplateService],
  exports: [EmailService],
})
export class EmailModule {}
