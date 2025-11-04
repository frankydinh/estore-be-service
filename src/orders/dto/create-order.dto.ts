import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class OrderItemDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ example: 999.99 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsNotEmpty()
  items: OrderItemDto[];

  @ApiProperty({ example: '123 Main St', required: false })
  @IsString()
  @IsOptional()
  shippingAddress?: string;

  @ApiProperty({ example: 'New York', required: false })
  @IsString()
  @IsOptional()
  shippingCity?: string;

  @ApiProperty({ example: 'USA', required: false })
  @IsString()
  @IsOptional()
  shippingCountry?: string;

  @ApiProperty({ example: '10001', required: false })
  @IsString()
  @IsOptional()
  shippingPostalCode?: string;

  @ApiProperty({ example: 'SAVE10', required: false })
  @IsString()
  @IsOptional()
  discountCode?: string;

  @ApiProperty({ example: 'Please deliver after 5 PM', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
