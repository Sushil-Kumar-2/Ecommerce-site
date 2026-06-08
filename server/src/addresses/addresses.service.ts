import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';

import { Address, AddressDocument } from './schemas/address.schema';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectModel(Address.name)
    private readonly addressModel: Model<Address>,
  ) {}

  async create(createAddressDto: CreateAddressDto, userId: string) {
    if (createAddressDto.isDefault) {
      await this.addressModel.updateMany({ userId }, { isDefault: false });
    }

    const isFirstAddress = (await this.addressModel.countDocuments({ userId })) === 0;

    const address = new this.addressModel({
      ...createAddressDto,
      userId,
      isDefault: createAddressDto.isDefault ?? isFirstAddress,
    });

    await address.save();

    return address;
  }

  async findMyAddresses(userId: string) {
    return this.addressModel
      .find({ userId })
      .sort({ isDefault: -1, createdAt: -1 });
  }

  async setDefaultAddress(addressId: string, userId: string) {
    const address = await this.findOneForUser(addressId, userId);

    await this.addressModel.updateMany({ userId }, { isDefault: false });

    address.isDefault = true;
    await address.save();

    return address;
  }

  async findOne(id: string): Promise<AddressDocument | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    return this.addressModel.findById(id);
  }

  async findOneForUser(
    addressId: string,
    userId: string,
  ): Promise<AddressDocument> {
    if (!isValidObjectId(addressId)) {
      throw new NotFoundException('Address not found');
    }

    const address = await this.addressModel.findById(addressId);

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.userId.toString() !== userId.toString()) {
      throw new ForbiddenException('You can only access your own addresses');
    }

    return address;
  }

  async getDefaultAddress(userId: string): Promise<AddressDocument | null> {
    return this.addressModel.findOne({
      userId,
      isDefault: true,
    });
  }

  async resolveForCheckout(
    userId: string,
    addressId?: string,
  ): Promise<AddressDocument> {
    const address = addressId
      ? await this.findOneForUser(addressId, userId)
      : await this.getDefaultAddress(userId);

    if (!address) {
      throw new BadRequestException(
        'No shipping address found. Add a default address or select one.',
      );
    }

    this.validateForCheckout(address);
    return address;
  }

  validateForCheckout(address: AddressDocument): void {
    const requiredFields = [
      'fullName',
      'phone',
      'addressLine1',
      'city',
      'state',
      'country',
      'pincode',
    ] as const;

    for (const field of requiredFields) {
      const value = address[field];

      if (typeof value !== 'string' || !value.trim()) {
        throw new BadRequestException(`Address is incomplete: missing ${field}`);
      }
    }

    if (!/^\d{6}$/.test(address.pincode.trim())) {
      throw new BadRequestException('Invalid pincode. Must be 6 digits.');
    }

    const normalizedPhone = address.phone.replace(/\s/g, '');

    if (!/^\+?\d{10,15}$/.test(normalizedPhone)) {
      throw new BadRequestException('Invalid phone number on shipping address');
    }
  }

  async update(id: string, updateAddressDto: UpdateAddressDto, userId: string) {
    const address = await this.findOneForUser(id, userId);

    if (updateAddressDto.isDefault === true) {
      await this.addressModel.updateMany({ userId }, { isDefault: false });
    }

    Object.assign(address, updateAddressDto);
    await address.save();

    this.validateForCheckout(address);

    return address;
  }

  async remove(id: string, userId: string) {
    const address = await this.findOneForUser(id, userId);
    const wasDefault = address.isDefault;

    await address.deleteOne();

    if (wasDefault) {
      const nextDefault = await this.addressModel
        .findOne({ userId })
        .sort({ createdAt: -1 });

      if (nextDefault) {
        nextDefault.isDefault = true;
        await nextDefault.save();
      }
    }

    return {
      success: true,
      message: 'Address deleted successfully',
    };
  }
}
