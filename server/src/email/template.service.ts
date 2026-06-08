import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { EmailTemplate } from './enums/email-template.enum';

@Injectable()
export class TemplateService {
  private readonly compiled = new Map<EmailTemplate, Handlebars.TemplateDelegate>();

  render(template: EmailTemplate, context: Record<string, unknown>): string {
    const compiled = this.getCompiled(template);
    return compiled(context);
  }

  private getCompiled(
    template: EmailTemplate,
  ): Handlebars.TemplateDelegate {
    const cached = this.compiled.get(template);
    if (cached) {
      return cached;
    }

    const filePath = path.join(__dirname, 'templates', `${template}.hbs`);
    const source = fs.readFileSync(filePath, 'utf8');
    const compiledTemplate = Handlebars.compile(source);
    this.compiled.set(template, compiledTemplate);
    return compiledTemplate;
  }
}
