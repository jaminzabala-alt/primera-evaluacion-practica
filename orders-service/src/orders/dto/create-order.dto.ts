import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 'Alfreds Futterkiste' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: 'Aniseed Syrup' })
  @IsString()
  @IsNotEmpty()
  product: string;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 10.5 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  unitPrice: number;

  @ApiPropertyOptional({ example: 'pending' })
  @IsOptional()
  @IsString()
  status?: string;
}
