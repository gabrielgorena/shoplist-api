import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Priority } from './create-item.dto.js';

export class UpdateItemDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  quantity?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @IsBoolean()
  @IsOptional()
  is_bought?: boolean;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  store_ids?: string[];
}
