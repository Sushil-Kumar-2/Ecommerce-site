import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';

import {
  ProductReport,
  ProductReportDocument,
} from '../notifications/schemas/product-report.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction, AuditResource } from '../audit-logs/audit-log.enums';
import { AdminProductReportFilterDto } from './dto/admin-product-report-filter.dto';

@Injectable()
export class AdminProductReportsService {
  constructor(
    @InjectModel(ProductReport.name)
    private readonly reportModel: Model<ProductReportDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll(filter: AdminProductReportFilterDto) {
    const page = Number(filter.page ?? '1');
    const limit = Number(filter.limit ?? '20');
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (filter.status) {
      query.status = filter.status;
    }

    const [reports, total] = await Promise.all([
      this.reportModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.reportModel.countDocuments(query),
    ]);

    const enriched = await Promise.all(
      reports.map(async (report) => {
        const [product, reporter] = await Promise.all([
          isValidObjectId(report.productId)
            ? this.productModel
                .findById(report.productId)
                .select('title images status merchantId')
            : null,
          isValidObjectId(report.userId)
            ? this.userModel.findById(report.userId).select('name email')
            : null,
        ]);

        return {
          ...report.toObject(),
          product: product
            ? {
                _id: product._id,
                title: product.title,
                images: product.images,
                status: product.status,
              }
            : null,
          reporter: reporter
            ? { _id: reporter._id, name: reporter.name, email: reporter.email }
            : null,
        };
      }),
    );

    return {
      data: enriched,
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
      throw new NotFoundException('Report not found');
    }

    const report = await this.reportModel.findById(id);

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const [product, reporter] = await Promise.all([
      isValidObjectId(report.productId)
        ? this.productModel.findById(report.productId)
        : null,
      isValidObjectId(report.userId)
        ? this.userModel.findById(report.userId).select('name email')
        : null,
    ]);

    return {
      ...report.toObject(),
      product,
      reporter: reporter
        ? { _id: reporter._id, name: reporter.name, email: reporter.email }
        : null,
    };
  }

  async review(id: string, adminId: string) {
    const report = await this.reportModel.findById(id);

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    report.status = 'reviewed';
    await report.save();

    await this.auditLogsService.createLog({
      userId: adminId,
      role: 'admin',
      action: AuditAction.PRODUCT_REPORT_REVIEWED,
      resource: AuditResource.PRODUCT_REPORT,
      resourceId: id,
      metadata: { productId: report.productId },
    });

    return report;
  }

  async resolve(id: string, adminId: string) {
    const report = await this.reportModel.findById(id);

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    report.status = 'resolved';
    await report.save();

    await this.auditLogsService.createLog({
      userId: adminId,
      role: 'admin',
      action: AuditAction.PRODUCT_REPORT_RESOLVED,
      resource: AuditResource.PRODUCT_REPORT,
      resourceId: id,
      metadata: { productId: report.productId },
    });

    return report;
  }
}
