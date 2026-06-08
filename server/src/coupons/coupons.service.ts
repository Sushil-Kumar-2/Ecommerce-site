import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Coupon, CouponDocument } from './schemas/coupon.schema';
import { Model } from 'mongoose';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction, AuditResource } from '../audit-logs/audit-log.enums';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name)
    private readonly couponModel: Model<CouponDocument>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(createCouponDto: CreateCouponDto) {
    const existingCoupon = await this.couponModel.findOne({
      code: createCouponDto.code.toUpperCase(),
    });

    if (existingCoupon) {
      throw new BadRequestException('Coupon code already exists');
    }

    const coupon = new this.couponModel({
      ...createCouponDto,
      code: createCouponDto.code.toUpperCase(),
    });

    const saved = await coupon.save();

    await this.auditLogsService.createLog({
      role: 'system',
      action: AuditAction.COUPON_CREATED,
      resource: AuditResource.COUPON,
      resourceId: saved._id.toString(),
      metadata: {
        code: saved.code,
        discountType: saved.discountType,
        discountValue: saved.discountValue,
      },
    });

    return saved;
  }

  async findAll(filter: { page?: string; limit?: string; isActive?: string } = {}) {
    const page = Number(filter.page ?? '1');
    const limit = Number(filter.limit ?? '20');
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (filter.isActive !== undefined) {
      query.isActive = filter.isActive === 'true';
    }

    const [data, total] = await Promise.all([
      this.couponModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.couponModel.countDocuments(query),
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
    const coupon = await this.couponModel.findById(id);

    if (!coupon) {
      throw new BadRequestException('Coupon not found');
    }

    return coupon;
  }

  async update(id: string, updateCouponDto: UpdateCouponDto) {
    const coupon = await this.couponModel.findByIdAndUpdate(
      id,
      updateCouponDto,
      { new: true },
    );

    if (!coupon) {
      throw new BadRequestException('Coupon not found');
    }

    return coupon;
  }

  async remove(id: string) {
    const coupon = await this.couponModel.findByIdAndDelete(id);

    if (!coupon) {
      throw new BadRequestException('Coupon not found');
    }

    return { success: true };
  }

  async getStats(id: string) {
    const coupon = await this.findOne(id);

    return {
      usageCount: coupon.usageCount,
      usageLimit: coupon.usageLimit ?? null,
      usedByCount: coupon.usedBy.length,
    };
  }

  async applyCoupon(code: string, orderAmount: number, userId: string) {
    const coupon = await this.couponModel.findOne({
      code: code.toUpperCase(),
    });

    if (!coupon) {
      throw new BadRequestException('Invalid coupon');
    }

    if (!coupon.isActive) {
      throw new BadRequestException('Coupon is inactive');
    }

    const now = new Date();

    if (now < coupon.startDate) {
      throw new BadRequestException('Coupon is not active yet');
    }

    if (now > coupon.expiryDate) {
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.minimumOrderAmount && orderAmount < coupon.minimumOrderAmount) {
      throw new BadRequestException(
        `Minimum order amount is ₹${coupon.minimumOrderAmount}`,
      );
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    if (coupon.usedBy.includes(userId)) {
      throw new BadRequestException('Coupon already used');
    }

    let discount = 0;

    if (coupon.discountType === 'percentage') {
      discount = (orderAmount * coupon.discountValue) / 100;

      if (
        coupon.maximumDiscountAmount &&
        discount > coupon.maximumDiscountAmount
      ) {
        discount = coupon.maximumDiscountAmount;
      }
    } else {
      discount = coupon.discountValue;
    }

    return {
      couponId: coupon._id,
      code: coupon.code,
      discount,
      finalAmount: orderAmount - discount,
    };
  }
  async markCouponAsUsed(code: string, userId: string) {
    await this.couponModel.updateOne(
      { code: code.toUpperCase() },
      {
        $inc: { usageCount: 1 },
        $addToSet: { usedBy: userId },
      },
    );
  }
}
