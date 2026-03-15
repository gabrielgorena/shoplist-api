import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator.js';
import { ItemsService } from './items.service.js';
import { CreateItemDto } from './dto/create-item.dto.js';
import { UpdateItemDto } from './dto/update-item.dto.js';
import { QueryItemsDto } from './dto/query-items.dto.js';

@Controller('items')
@UseGuards(AuthGuard)
export class ItemsController {
  constructor(private readonly items: ItemsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryItemsDto) {
    return this.items.findAll(user.id, {
      storeId: query.store_id,
      priority: query.priority,
      showBought: query.show_bought,
    });
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateItemDto) {
    return this.items.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.items.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.items.remove(user.id, id);
  }
}
