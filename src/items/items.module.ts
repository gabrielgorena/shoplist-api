import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller.js';
import { ItemsService } from './items.service.js';
import { StoresModule } from '../stores/stores.module.js';

@Module({
  imports: [StoresModule],
  controllers: [ItemsController],
  providers: [ItemsService],
  exports: [ItemsService],
})
export class ItemsModule {}
