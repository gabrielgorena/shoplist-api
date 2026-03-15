import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateFamilyDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name!: string;
}
