import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';
import { ProfilesService } from '../profiles/profiles.service.js';
import { StoresService } from '../stores/stores.service.js';

@Injectable()
export class FamiliesService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly profiles: ProfilesService,
    private readonly stores: StoresService,
  ) {}

  async createFamily(userId: string, name: string) {
    const db = this.supabase.getClient();

    const { data: family, error } = await db
      .from('families')
      .insert({ name: name.trim(), created_by: userId })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    // Assign user to the new family
    await this.profiles.updateProfile(userId, { family_id: family.id });

    // Create default stores for this family
    await this.stores.createDefaultStores(family.id);

    return family;
  }

  async joinFamily(userId: string, code: string) {
    const db = this.supabase.getClient();

    const { data: family, error } = await db
      .from('families')
      .select('id, name')
      .eq('invite_code', code.trim().toLowerCase())
      .single();

    if (error || !family) {
      throw new NotFoundException('Código de invitación no válido');
    }

    await this.profiles.updateProfile(userId, { family_id: family.id });

    return family;
  }

  async getMyFamily(userId: string) {
    const familyId = await this.profiles.getFamilyId(userId);
    const db = this.supabase.getClient();

    const { data: family, error } = await db
      .from('families')
      .select('*')
      .eq('id', familyId)
      .single();

    if (error || !family) {
      throw new NotFoundException('Familia no encontrada');
    }

    return family;
  }

  async getMembers(userId: string) {
    const familyId = await this.profiles.getFamilyId(userId);
    const db = this.supabase.getClient();

    const { data: members, error } = await db
      .from('profiles')
      .select('id, name, avatar_url, created_at')
      .eq('family_id', familyId)
      .order('created_at');

    if (error) {
      throw new BadRequestException(error.message);
    }

    return members;
  }
}
