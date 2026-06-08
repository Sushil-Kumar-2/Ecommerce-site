import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { isValidObjectId } from 'mongoose';
import {
  ProductReport,
  ProductReportDocument,
} from './schemas/product-report.schema';
import { CreateProductReportDto } from './dto/create-product-report.dto';
import { NotificationEventsService } from './notification-events.service';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction, AuditResource } from '../audit-logs/audit-log.enums';

@Injectable()
export class ProductReportsService {
  constructor(
    @InjectModel(ProductReport.name)
    private readonly reportModel: Model<ProductReportDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly notificationEvents: NotificationEventsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(
    productId: string,
    userId: string,
    dto: CreateProductReportDto,
  ): Promise<ProductReportDocument> {
    if (!isValidObjectId(productId)) {
      throw new NotFoundException('Product not found');
    }

    const product = await this.productModel.findById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const report = await this.reportModel.create({
      userId,
      productId,
      reason: dto.reason,
    });

    await this.notificationEvents.notifyProductReported(
      report._id.toString(),
      productId,
      product.title,
      dto.reason,
      userId,
    );

    await this.auditLogsService.createLog({
      userId,
      role: 'user',
      action: AuditAction.PRODUCT_REPORTED,
      resource: AuditResource.PRODUCT_REPORT,
      resourceId: report._id.toString(),
      metadata: {
        productId,
        productTitle: product.title,
        reason: dto.reason,
      },
    });

    return report;
  }
}
