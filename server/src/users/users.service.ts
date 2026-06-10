import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileImagesDto } from './dto/update-profile-images.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
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
      role: createUserDto.role ?? 'user',
      status: 'active',
      password: hashedPassword,
    });

    const saved = await user.save();
    return saved;
  }

  async createMerchant(dto: CreateMerchantDto) {
    const existingUser = await this.userModel.findOne({ email: dto.email });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = new this.userModel({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      phone: dto.phone,
      shopName: dto.shopName,
      shopDescription: dto.shopDescription,
      businessAddress: dto.businessAddress,
      gstNumber: dto.gstNumber,
      role: 'merchant',
      status: 'pending',
    });

    const saved = await user.save();

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
        shopName: saved.shopName,
      },
    });

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

  async findOrCreateGoogleUser(data: {
    googleId: string;
    email: string;
    name: string;
    picture?: string;
  }): Promise<UserDocument> {
    const normalizedEmail = data.email.toLowerCase().trim();
    let user = await this.userModel.findOne({
      $or: [{ googleId: data.googleId }, { email: normalizedEmail }],
    });

    if (user) {
      let shouldSave = false;

      if (!user.googleId) {
        user.googleId = data.googleId;
        user.authProvider = 'google';
        shouldSave = true;
      }

      if (data.picture && !user.avatar) {
        user.avatar = data.picture;
        shouldSave = true;
      }

      if (!user.emailVerified) {
        user.emailVerified = true;
        shouldSave = true;
      }

      if (shouldSave) {
        await user.save();
      }

      return user;
    }

    const hashedPassword = await bcrypt.hash(
      crypto.randomBytes(32).toString('hex'),
      10,
    );

    user = await this.userModel.create({
      name: data.name,
      email: normalizedEmail,
      password: hashedPassword,
      googleId: data.googleId,
      authProvider: 'google',
      avatar: data.picture,
      emailVerified: true,
      role: 'user',
      status: 'active',
    });

    return user;
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
