import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient;

  constructor(private readonly config: ConfigService) {
    const url = this.config.getOrThrow<string>('SUPABASE_URL');
    const serviceRoleKey = this.config.getOrThrow<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    this.client = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /** Admin client that bypasses RLS */
  getClient(): SupabaseClient {
    return this.client;
  }

  /** Validate a Supabase JWT and return the user */
  async getUserFromToken(token: string) {
    const { data, error } = await this.client.auth.getUser(token);

    if (error || !data.user) {
      return null;
    }

    return data.user;
  }
}
