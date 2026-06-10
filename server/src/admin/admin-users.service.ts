import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';

import { User, UserDocument } from '../users/schemas/user.schema';
import { Order } from '../orders/schemas/order.schema';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction, AuditResource } from '../audit-logs/audit-log.enums';
import { AdminUserFilterDto } from './dto/admin-user-filter.dto';

const USER_SELECT = '-password';

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async findAll(filter: AdminUserFilterDto) {
    const page = Number(filter.page ?? '1');
    const limit = Number(filter.limit ?? '20');
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (filter.role) {
      query.role = filter.role;
    }

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.search) {
      const searchRegex = new RegExp(filter.search, 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const [data, total] = await Promise.all([
      this.userModel
        .find(query)
        .select(USER_SELECT)
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
      throw new NotFoundException('User not found');
    }

    const user = await this.userModel.findById(id).select(USER_SELECT);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findUserOrders(userId: string) {
    await this.findOne(userId);
    return this.orderModel.find({ userId }).sort({ createdAt: -1 });
  }

  async deactivate(id: string, adminId: string) {
    const user = await this.findOne(id);
    user.status = 'blocked';
    await user.save();

    await this.auditLogsService.createLog({
      userId: adminId,
      role: 'admin',
      action: AuditAction.USER_DEACTIVATED,
      resource: AuditResource.USER,
      resourceId: id,
      metadata: { email: user.email },
    });

    return user;
  }

  async activate(id: string, adminId: string) {
    const user = await this.findOne(id);
    user.status = 'active';
    await user.save();

    await this.auditLogsService.createLog({
      userId: adminId,
      role: 'admin',
      action: AuditAction.USER_ACTIVATED,
      resource: AuditResource.USER,
      resourceId: id,
      metadata: { email: user.email },
    });

    return user;
  }
}
