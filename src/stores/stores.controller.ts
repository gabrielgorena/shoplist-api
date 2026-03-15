import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator.js';
import { StoresService } from './stores.service.js';
import { CreateStoreDto } from './dto/create-store.dto.js';
import { UpdateStoreDto } from './dto/update-store.dto.js';

@Controller('stores')
@UseGuards(AuthGuard)
export class StoresController {
  constructor(private readonly stores: StoresService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.stores.findAllByFamily(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateStoreDto) {
    return this.stores.create(user.id, dto.name, dto.icon ?? 'ShoppingCart');
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateStoreDto,
  ) {
    return this.stores.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.stores.remove(user.id, id);
  }
}
