import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Category } from './schemas/category.schema';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction, AuditResource } from '../audit-logs/audit-log.enums';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<Category>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, actor?: JwtUser) {
    const category = new this.categoryModel(createCategoryDto);

    const saved = await category.save();

    if (actor) {
      await this.auditLogsService.createLog({
        userId: actor.userId,
        role: actor.role,
        action: AuditAction.CATEGORY_CREATED,
        resource: AuditResource.CATEGORY,
        resourceId: saved._id.toString(),
        metadata: {
          name: saved.name,
          slug: saved.slug,
        },
      });
    }

    return saved;
  }
  async findAll() {
    return this.categoryModel.find();
  }
  async findOne(id: string) {
    return this.categoryModel.findById(id);
  }
  async update(id: string, updateCategoryDto: UpdateCategoryDto, actor?: JwtUser) {
    const updated = await this.categoryModel.findByIdAndUpdate(id, updateCategoryDto, {
      new: true,
    });

    if (updated && actor) {
      await this.auditLogsService.createLog({
        userId: actor.userId,
        role: actor.role,
        action: AuditAction.CATEGORY_UPDATED,
        resource: AuditResource.CATEGORY,
        resourceId: updated._id.toString(),
        metadata: {
          name: updated.name,
          changes: updateCategoryDto,
        },
      });
    }

    return updated;
  }
  async remove(id: string) {
    return this.categoryModel.findByIdAndDelete(id);
  }
}
