import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
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
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateReviewDto } from './dto/update-review.dto';
import {
  SWAGGER_BEARER_AUTH,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '../common/swagger/swagger.constants';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Create a product review' })
  @ApiResponse({ status: 201, description: 'Review created' })
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiBadRequestResponse)
  create(
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.reviewsService.create(createReviewDto, user.userId);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'List reviews for a product' })
  @ApiParam({ name: 'productId', description: 'Product MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Product reviews' })
  @ApiResponse(ApiNotFoundResponse)
  findByProduct(@Param('productId') productId: string) {
    return this.reviewsService.findByProduct(productId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Update own review' })
  @ApiParam({ name: 'id', description: 'Review MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Updated review' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  @ApiResponse(ApiBadRequestResponse)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.reviewsService.update(id, user.userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SWAGGER_BEARER_AUTH)
  @ApiOperation({ summary: 'Delete own review' })
  @ApiParam({ name: 'id', description: 'Review MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Review deleted' })
  @ApiResponse(ApiNotFoundResponse)
  @ApiResponse(ApiUnauthorizedResponse)
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.reviewsService.remove(id, user.userId);
  }
}
