import { IsNotEmpty, IsString } from 'class-validator';

export class JoinFamilyDto {
  @IsString()
  @IsNotEmpty({ message: 'El código es requerido' })
  code!: string;
}
