import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDate,
  IsBoolean,
  IsArray,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DiscountType } from '../../common/enums';

export class CreateDiscountDto {
  @ApiProperty({ example: 'SAVE10' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: '10% Off Summer Sale' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Get 10% off on all products', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: DiscountType, example: DiscountType.PERCENTAGE })
  @IsEnum(DiscountType)
  @IsNotEmpty()
  type: DiscountType;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  value: number;

  @ApiProperty({ example: 50, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minOrderAmount?: number;

  @ApiProperty({ example: 100, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxDiscountAmount?: number;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @ApiProperty({ example: '2024-12-31T23:59:59Z', required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @ApiProperty({ example: 100, required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  usageLimit?: number;

  @ApiProperty({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  isEventBased?: boolean;

  @ApiProperty({ example: 'Black Friday', required: false })
  @IsString()
  @IsOptional()
  eventName?: string;

  @ApiProperty({ example: [1, 2, 3], required: false })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  productIds?: number[];
}
