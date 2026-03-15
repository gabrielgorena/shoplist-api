import { Module, forwardRef } from '@nestjs/common';
import { FamiliesController } from './families.controller.js';
import { FamiliesService } from './families.service.js';
import { StoresModule } from '../stores/stores.module.js';

@Module({
  imports: [forwardRef(() => StoresModule)],
  controllers: [FamiliesController],
  providers: [FamiliesService],
  exports: [FamiliesService],
})
export class FamiliesModule {}
