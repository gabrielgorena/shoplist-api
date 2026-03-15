import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name!: string;

  @IsString()
  @IsOptional()
  icon?: string = 'ShoppingCart';
}
