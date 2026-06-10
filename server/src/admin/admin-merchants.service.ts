import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';

import { User, UserDocument } from '../users/schemas/user.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction, AuditResource } from '../audit-logs/audit-log.enums';
import { AdminMerchantFilterDto } from './dto/admin-merchant-filter.dto';
import { RejectMerchantDto } from './dto/reject-merchant.dto';

const MERCHANT_SELECT = '-password';

@Injectable()
export class AdminMerchantsService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll(filter: AdminMerchantFilterDto) {
    const page = Number(filter.page ?? '1');
    const limit = Number(filter.limit ?? '20');
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { role: 'merchant' };

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.search) {
      const searchRegex = new RegExp(filter.search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { shopName: searchRegex },
      ];
    }

    const [data, total] = await Promise.all([
      this.userModel
        .find(query)
        .select(MERCHANT_SELECT)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.userModel.countDocuments(query),
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
      throw new NotFoundException('Merchant not found');
    }

    const merchant = await this.userModel
      .findOne({ _id: id, role: 'merchant' })
      .select(MERCHANT_SELECT);

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    return merchant;
  }

  async findMerchantProducts(merchantId: string) {
    if (!isValidObjectId(merchantId)) {
      throw new NotFoundException('Merchant not found');
    }

    const merchant = await this.userModel.findOne({
      _id: merchantId,
      role: 'merchant',
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    return this.productModel.find({ merchantId }).sort({ createdAt: -1 });
  }

  async activate(id: string, adminId: string) {
    const merchant = await this.findOne(id);

    merchant.status = 'active';
    await merchant.save();

    await this.auditLogsService.createLog({
      userId: adminId,
      role: 'admin',
      action: AuditAction.MERCHANT_ACTIVATED,
      resource: AuditResource.USER,
      resourceId: id,
      metadata: { merchantEmail: merchant.email },
    });

    return merchant;
  }

  async block(id: string, adminId: string) {
    const merchant = await this.findOne(id);

    merchant.status = 'blocked';
    await merchant.save();

    await this.auditLogsService.createLog({
      userId: adminId,
      role: 'admin',
      action: AuditAction.MERCHANT_BLOCKED,
      resource: AuditResource.USER,
      resourceId: id,
      metadata: { merchantEmail: merchant.email },
    });

    return merchant;
  }

  async reject(id: string, adminId: string, dto: RejectMerchantDto) {
    const merchant = await this.findOne(id);

    if (merchant.status !== 'pending') {
      throw new BadRequestException(
        'Only pending merchant applications can be rejected',
      );
    }

    merchant.status = 'blocked';
    await merchant.save();

    await this.auditLogsService.createLog({
      userId: adminId,
      role: 'admin',
      action: AuditAction.MERCHANT_REJECTED,
      resource: AuditResource.USER,
      resourceId: id,
      metadata: {
        merchantEmail: merchant.email,
        reason: dto.reason ?? null,
      },
    });

    return merchant;
  }
}
