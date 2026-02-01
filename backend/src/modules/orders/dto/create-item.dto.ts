import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsPositive,
} from 'class-validator';

export class CreateItemDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsPositive()
  priceAmount: number;

  @IsString()
  @IsOptional()
  priceCurrency?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number;
}
