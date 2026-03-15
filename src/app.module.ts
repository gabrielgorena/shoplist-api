import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ProfilesModule } from './profiles/profiles.module.js';
import { FamiliesModule } from './families/families.module.js';
import { StoresModule } from './stores/stores.module.js';
import { ItemsModule } from './items/items.module.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    AuthModule,
    ProfilesModule,
    FamiliesModule,
    StoresModule,
    ItemsModule,
    HealthModule,
  ],
})
export class AppModule {}
