import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';

@Injectable()
export class AuthService {
  constructor(private readonly supabase: SupabaseService) {}

  async validateToken(token: string) {
    return this.supabase.getUserFromToken(token);
  }
}
