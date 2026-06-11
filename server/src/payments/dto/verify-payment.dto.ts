import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty({
    description: 'Internal order ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({
    description: 'Razorpay order ID returned during payment initiation',
    example: 'order_MNopQrStUvWxYz',
  })
  @IsString()
  @IsNotEmpty()
  razorpayOrderId: string;

  @ApiProperty({
    description: 'Razorpay payment ID after successful payment',
    example: 'pay_MNopQrStUvWxYz',
  })
  @IsString()
  @IsNotEmpty()
  razorpayPaymentId: string;

  @ApiProperty({
    description: 'HMAC signature from Razorpay for payment verification',
    example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
  })
  @IsString()
  @IsNotEmpty()
  razorpaySignature: string;
}
