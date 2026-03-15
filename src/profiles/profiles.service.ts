import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';

export interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  family_id: string | null;
  created_at: string;
}

@Injectable()
export class ProfilesService {
  constructor(private readonly supabase: SupabaseService) {}

  async getProfile(userId: string): Promise<Profile> {
    const { data, error } = await this.supabase
      .getClient()
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new BadRequestException('Perfil no encontrado');
    }

    return data;
  }

  async getFamilyId(userId: string): Promise<string> {
    const profile = await this.getProfile(userId);

    if (!profile.family_id) {
      throw new BadRequestException('No perteneces a una familia');
    }

    return profile.family_id;
  }

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await this.supabase
      .getClient()
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }
}
