import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, IsArray, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProductStatus } from '../../common/enums';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 14 Pro' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Latest iPhone with advanced camera system', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 999.99 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: 100, default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiProperty({ example: 'IPH14PRO-001', required: false })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({ example: ['image1.jpg', 'image2.jpg'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiProperty({ enum: ProductStatus, default: ProductStatus.ACTIVE })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiProperty({ example: { color: 'Space Gray', storage: '256GB' }, required: false })
  @IsOptional()
  specifications?: Record<string, string>;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  categoryId?: number;
}
