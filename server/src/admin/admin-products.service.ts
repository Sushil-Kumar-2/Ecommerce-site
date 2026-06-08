import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';

import { Product, ProductDocument } from '../products/schemas/product.schema';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction, AuditResource } from '../audit-logs/audit-log.enums';
import { AdminProductFilterDto } from './dto/admin-product-filter.dto';
import { RejectProductDto } from './dto/reject-product.dto';

@Injectable()
export class AdminProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll(filter: AdminProductFilterDto) {
    const page = Number(filter.page ?? '1');
    const limit = Number(filter.limit ?? '20');
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.featured !== undefined) {
      query.featured = filter.featured;
    }

    if (filter.search) {
      query.title = new RegExp(filter.search, 'i');
    }

    const [data, total] = await Promise.all([
      this.productModel
        .find(query)
        .populate('categoryId', 'name slug')
        .populate('merchantId', 'name email shopName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.productModel.countDocuments(query),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Product not found');
    }

    const product = await this.productModel
      .findById(id)
      .populate('categoryId', 'name slug')
      .populate('merchantId', 'name email shopName');

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async approve(id: string, adminId: string) {
    const product = await this.findOne(id);
    product.status = 'approved';
    await product.save();

    await this.auditLogsService.createLog({
      userId: adminId,
      role: 'admin',
      action: AuditAction.PRODUCT_APPROVED,
      resource: AuditResource.PRODUCT,
      resourceId: id,
      metadata: { title: product.title },
    });

    return product;
  }

  async reject(id: string, adminId: string, dto: RejectProductDto) {
    const product = await this.findOne(id);
    product.status = 'rejected';
    await product.save();

    await this.auditLogsService.createLog({
      userId: adminId,
      role: 'admin',
      action: AuditAction.PRODUCT_REJECTED,
      resource: AuditResource.PRODUCT,
      resourceId: id,
      metadata: { title: product.title, reason: dto.reason },
    });

    return product;
  }

  async feature(id: string, adminId: string) {
    const product = await this.findOne(id);
    product.featured = true;
    await product.save();

    await this.auditLogsService.createLog({
      userId: adminId,
      role: 'admin',
      action: AuditAction.PRODUCT_FEATURED,
      resource: AuditResource.PRODUCT,
      resourceId: id,
      metadata: { title: product.title, featured: true },
    });

    return product;
  }

  async unfeature(id: string, adminId: string) {
    const product = await this.findOne(id);
    product.featured = false;
    await product.save();

    await this.auditLogsService.createLog({
      userId: adminId,
      role: 'admin',
      action: AuditAction.PRODUCT_FEATURED,
      resource: AuditResource.PRODUCT,
      resourceId: id,
      metadata: { title: product.title, featured: false },
    });

    return product;
  }
}
