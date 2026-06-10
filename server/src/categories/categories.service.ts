import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';

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

  private normalizeCategoryDto<T extends CreateCategoryDto | UpdateCategoryDto>(
    dto: T,
  ): T {
    const status =
      dto.status ?? (dto.isActive === false ? 'inactive' : 'active');
    return {
      ...dto,
      status,
      isActive: status === 'active',
    };
  }

  async create(createCategoryDto: CreateCategoryDto, actor?: JwtUser) {
    const payload = this.normalizeCategoryDto(createCategoryDto);
    const category = new this.categoryModel(payload);

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

  async findAll(includeAll = false) {
    if (includeAll) {
      return this.categoryModel.find().sort({ name: 1 });
    }

    return this.categoryModel
      .find({
        $and: [
          {
            $or: [
              { status: 'active' },
              {
                status: { $exists: false },
                isActive: { $ne: false },
              },
            ],
          },
          {
            $or: [
              { parentCategory: { $exists: false } },
              { parentCategory: null },
            ],
          },
        ],
      })
      .sort({ name: 1 });
  }

  async findOne(id: string) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Category not found');
    }

    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    actor?: JwtUser,
  ) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Category not found');
    }

    const payload = this.normalizeCategoryDto(updateCategoryDto);
    const updated = await this.categoryModel.findByIdAndUpdate(id, payload, {
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
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Category not found');
    }

    return this.categoryModel.findByIdAndDelete(id);
  }
}
