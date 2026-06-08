import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileImagesDto } from './dto/update-profile-images.dto';
import * as bcrypt from 'bcrypt';
import { NotificationEventsService } from '../notifications/notification-events.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction, AuditResource } from '../audit-logs/audit-log.enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @Inject(forwardRef(() => NotificationEventsService))
    private readonly notificationEvents: NotificationEventsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    const saved = await user.save();

    if (saved.role === 'merchant') {
      await this.notificationEvents.notifyNewMerchantRegistered(
        saved._id.toString(),
        saved.name,
        saved.email,
      );

      await this.auditLogsService.createLog({
        userId: saved._id.toString(),
        role: 'merchant',
        action: AuditAction.MERCHANT_REGISTERED,
        resource: AuditResource.USER,
        resourceId: saved._id.toString(),
        metadata: {
          name: saved.name,
          email: saved.email,
        },
      });
    }

    return saved;
  }

  findAll() {
    return this.userModel.find();
  }

  async findByRole(role: string): Promise<UserDocument[]> {
    return this.userModel.find({ role, status: 'active' });
  }
  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  findOne(id: string) {
    return this.userModel.findById(id);
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
    });
  }

  async updateProfileImages(userId: string, dto: UpdateProfileImagesDto) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.shopLogo && user.role !== 'merchant' && user.role !== 'admin') {
      throw new BadRequestException('Only merchants can set a shop logo');
    }

    if (dto.avatar !== undefined) {
      user.avatar = dto.avatar;
    }

    if (dto.shopLogo !== undefined) {
      user.shopLogo = dto.shopLogo;
    }

    await user.save();

    return {
      success: true,
      avatar: user.avatar ?? null,
      shopLogo: user.shopLogo ?? null,
    };
  }

  remove(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }
}
