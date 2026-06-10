import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';
import { AuditAction } from './audit-log.enums';
import { CreateAuditLogInput } from './interfaces/audit-log.interface';
import { AuditLogFilterDto } from './dto/audit-log-filter.dto';
import { AuditContextService } from './audit-context.service';
import { PaginatedAuditLogsResponse } from './interfaces/paginated-audit-logs.interface';

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
    private readonly auditContextService: AuditContextService,
  ) {}

  async createLog(input: CreateAuditLogInput): Promise<AuditLogDocument> {
    try {
      const requestMeta = this.auditContextService.getRequestMeta();

      const log = await this.auditLogModel.create({
        userId:
          input.userId && isValidObjectId(input.userId)
            ? new Types.ObjectId(input.userId)
            : undefined,
        role: input.role,
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId,
        metadata: input.metadata ?? {},
        ipAddress: input.ipAddress ?? requestMeta?.ipAddress,
        userAgent: input.userAgent ?? requestMeta?.userAgent,
      });

      return log;
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
      throw error;
    }
  }

  async getLogs(
    filter: AuditLogFilterDto = {},
  ): Promise<PaginatedAuditLogsResponse> {
    const page = Number(filter.page ?? '1');
    const limit = Number(filter.limit ?? '20');
    const skip = (page - 1) * limit;

    const query: {
      action?: AuditAction;
      resource?: string;
      userId?: Types.ObjectId;
      createdAt?: { $gte?: Date; $lte?: Date };
    } = {};

    if (filter.action) {
      query.action = filter.action;
    }

    if (filter.resource) {
      query.resource = filter.resource;
    }

    if (filter.userId && isValidObjectId(filter.userId)) {
      query.userId = new Types.ObjectId(filter.userId);
    }

    if (filter.from || filter.to) {
      query.createdAt = {};
      if (filter.from) {
        query.createdAt.$gte = new Date(filter.from);
      }
      if (filter.to) {
        query.createdAt.$lte = new Date(filter.to);
      }
    }

    const [data, total] = await Promise.all([
      this.auditLogModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.auditLogModel.countDocuments(query),
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

  async getLogsByUser(
    userId: string,
    filter: AuditLogFilterDto = {},
  ): Promise<PaginatedAuditLogsResponse> {
    return this.getLogs({ ...filter, userId });
  }

  async getLogsByAction(
    action: AuditAction,
    filter: AuditLogFilterDto = {},
  ): Promise<PaginatedAuditLogsResponse> {
    return this.getLogs({ ...filter, action });
  }

  async getLogsByResource(
    resource: string,
    filter: AuditLogFilterDto = {},
  ): Promise<PaginatedAuditLogsResponse> {
    return this.getLogs({ ...filter, resource });
  }

  async findOne(id: string): Promise<AuditLogDocument> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Audit log not found');
    }

    const log = await this.auditLogModel.findById(id);

    if (!log) {
      throw new NotFoundException('Audit log not found');
    }

    return log;
  }
}
