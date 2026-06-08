import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '../common/swagger/swagger.constants';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order/:orderId')
  @ApiOperation({ summary: 'Create Razorpay order for payment' })
  @ApiParam({ name: 'orderId', description: 'Order MongoDB ObjectId' })
  @ApiResponse({ status: 201, description: 'Razorpay order created' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiBadRequestResponse)
  createRazorpayOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.createRazorpayOrder(orderId);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify Razorpay payment signature' })
  @ApiResponse({
    status: 200,
    description: 'Payment verified and order updated',
  })
  @ApiResponse(ApiBadRequestResponse)
  verifyPayment(@Body() verifyPaymentDto: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(verifyPaymentDto);
  }

  @Post('failed/:orderId')
  @ApiOperation({ summary: 'Mark payment as failed for an order' })
  @ApiParam({ name: 'orderId', description: 'Order MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Payment marked as failed' })
  @ApiResponse(ApiNotFoundResponse)
  markPaymentFailed(@Param('orderId') orderId: string) {
    return this.paymentsService.markPaymentFailed(orderId);
  }

  @Get()
  @ApiOperation({ summary: 'List all payment records' })
  @ApiResponse({ status: 200, description: 'Payment records' })
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment record by ID' })
  @ApiParam({ name: 'id', description: 'Payment record ID' })
  @ApiResponse({ status: 200, description: 'Payment details' })
  @ApiResponse(ApiNotFoundResponse)
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete payment record by ID' })
  @ApiParam({ name: 'id', description: 'Payment record ID' })
  @ApiResponse({ status: 200, description: 'Payment deleted' })
  @ApiResponse(ApiNotFoundResponse)
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(+id);
  }
}
