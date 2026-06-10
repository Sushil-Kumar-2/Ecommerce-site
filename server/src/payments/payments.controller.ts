import {
  Controller,
  Get,
  Post,
  Body,
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
import { PaymentsService } from './payments.service';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/roles.enum';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  SWAGGER_BEARER_AUTH,
} from '../common/swagger/swagger.constants';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Create Razorpay order for payment' })
  @ApiParam({ name: 'orderId', description: 'Order MongoDB ObjectId' })
  @ApiResponse({ status: 201, description: 'Razorpay order created' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiBadRequestResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  createRazorpayOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.createRazorpayOrder(orderId);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Verify Razorpay payment signature' })
  @ApiResponse({
    status: 200,
    description: 'Payment verified and order updated',
  })
  @ApiResponse(ApiBadRequestResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  verifyPayment(@Body() verifyPaymentDto: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(verifyPaymentDto);
  }

  @Post('failed/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Mark payment as failed for an order' })
  @ApiParam({ name: 'orderId', description: 'Order MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Payment marked as failed' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  markPaymentFailed(@Param('orderId') orderId: string) {
    return this.paymentsService.markPaymentFailed(orderId);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'List all payment records (admin only)' })
  @ApiResponse({ status: 200, description: 'Payment records' })
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiForbiddenResponse)
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Get payment record by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'Payment MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Payment details' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiForbiddenResponse)
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Delete payment record by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'Payment MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Payment deleted' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiForbiddenResponse)
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
