import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  SWAGGER_BEARER_AUTH,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '../common/swagger/swagger.constants';

@ApiTags('Addresses')
@ApiBearerAuth(SWAGGER_BEARER_AUTH)
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a delivery address' })
  @ApiResponse({ status: 201, description: 'Address created' })
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiBadRequestResponse)
  create(
    @Body() createAddressDto: CreateAddressDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.addressesService.create(createAddressDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'List addresses for current user' })
  @ApiResponse({ status: 200, description: 'User addresses' })
  @ApiResponse(ApiUnauthorizedResponse)
  findMyAddresses(@CurrentUser() user: JwtUser) {
    return this.addressesService.findMyAddresses(user.userId);
  }

  @Patch(':id/default')
  @ApiOperation({ summary: 'Set address as default' })
  @ApiParam({ name: 'id', description: 'Address MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Default address updated' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  setDefaultAddress(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.addressesService.setDefaultAddress(id, user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get address by ID' })
  @ApiParam({ name: 'id', description: 'Address MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Address details' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  findOne(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.addressesService.findOneForUser(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an address' })
  @ApiParam({ name: 'id', description: 'Address MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Updated address' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiBadRequestResponse)
  update(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.addressesService.update(id, updateAddressDto, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address' })
  @ApiParam({ name: 'id', description: 'Address MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Address deleted' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.addressesService.remove(id, user.userId);
  }
}
