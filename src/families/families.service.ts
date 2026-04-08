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
    await this.ensureUserHasNoFamily(userId);
    const db = this.supabase.getClient();
    const trimmedName = name.trim();

    if (!trimmedName) {
      throw new BadRequestException('El nombre es requerido');
    }

    const { data: family, error } = await db
      .from('families')
      .insert({ name: trimmedName, created_by: userId })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    try {
      await this.profiles.updateProfile(userId, { family_id: family.id });
      await this.stores.createDefaultStores(family.id);
    } catch (cause) {
      await db.from('families').delete().eq('id', family.id);
      throw cause;
    }

    return family;
  }

  async joinFamily(userId: string, code: string) {
    await this.ensureUserHasNoFamily(userId);
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

  private async ensureUserHasNoFamily(userId: string) {
    const profile = await this.profiles.getProfile(userId);

    if (profile.family_id) {
      throw new BadRequestException('Ya perteneces a una familia');
    }
  }
}
