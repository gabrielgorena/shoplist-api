import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export enum Priority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export class CreateItemDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name!: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  quantity?: number = 1;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority = Priority.MEDIUM;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  store_ids?: string[];
}
