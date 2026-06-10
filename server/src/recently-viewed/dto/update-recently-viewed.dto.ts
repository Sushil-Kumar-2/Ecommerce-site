import { PartialType } from '@nestjs/swagger';
import { CreateRecentlyViewedDto } from './create-recently-viewed.dto';

export class UpdateRecentlyViewedDto extends PartialType(
  CreateRecentlyViewedDto,
) {}
