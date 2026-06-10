import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ProfileResponse } from './interfaces/profile-response.interface';
import { EmailService } from '../email/email.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction, AuditResource } from '../audit-logs/audit-log.enums';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly emailService: EmailService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async getProfile(userId: string): Promise<ProfileResponse> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toProfileResponse(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<ProfileResponse> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email.toLowerCase() !== user.email.toLowerCase()) {
      const existing = await this.userModel.findOne({
        email: dto.email.toLowerCase(),
        _id: { $ne: userId },
      });

      if (existing) {
        throw new BadRequestException('Email is already in use');
      }

      user.email = dto.email.toLowerCase();
      user.emailVerified = false;
    }

    if (dto.name !== undefined) {
      user.name = dto.name.trim();
    }

    if (dto.phone !== undefined) {
      user.phone = dto.phone.trim();
    }

    await user.save();

    await this.auditLogsService.createLog({
      userId,
      role: user.role,
      action: AuditAction.USER_PROFILE_UPDATED,
      resource: AuditResource.PROFILE,
      resourceId: userId,
      metadata: {
        updatedFields: Object.keys(dto),
      },
    });

    return this.toProfileResponse(user);
  }

  async updateAvatar(
    userId: string,
    dto: UpdateAvatarDto,
  ): Promise<ProfileResponse> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.avatar = dto.avatar;
    await user.save();

    return this.toProfileResponse(user);
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.password) {
      throw new BadRequestException(
        'Password change is not available for Google sign-in accounts.',
      );
    }

    const isCurrentValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isCurrentValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await user.save();

    try {
      await this.emailService.sendPasswordChanged(user.email, user.name);
    } catch {
      // Password change succeeded; email failure should not block the response
    }

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  private toProfileResponse(user: UserDocument): ProfileResponse {
    const timestamps = user as UserDocument & {
      createdAt?: Date;
      updatedAt?: Date;
    };

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone ?? null,
      avatar: user.avatar ?? null,
      role: user.role,
      shopLogo: user.shopLogo ?? null,
      shopName: user.shopName ?? null,
      emailVerified: user.emailVerified,
      createdAt: timestamps.createdAt ?? new Date(),
      updatedAt: timestamps.updatedAt ?? new Date(),
    };
  }
}
