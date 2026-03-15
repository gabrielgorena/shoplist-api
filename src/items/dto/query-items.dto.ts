import { IsBoolean, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { Priority } from './create-item.dto.js';

export class QueryItemsDto {
  @IsUUID()
  @IsOptional()
  store_id?: string;

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  show_bought?: boolean = false;
}
