import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Smartphones' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'All types of smartphones', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  parentId?: number;

  @ApiProperty({ example: 1, default: 0 })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}
