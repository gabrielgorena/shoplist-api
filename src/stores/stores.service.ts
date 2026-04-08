import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';
import { ProfilesService } from '../profiles/profiles.service.js';

const DEFAULT_STORES = [
  { name: 'Supermercado', icon: 'ShoppingCart' },
  { name: 'Mercado', icon: 'Store' },
  { name: 'Farmacia', icon: 'Pill' },
  { name: 'Ferretería', icon: 'Wrench' },
  { name: 'Tienda de barrio', icon: 'House' },
  { name: 'Online', icon: 'Package' },
];

@Injectable()
export class StoresService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly profiles: ProfilesService,
  ) {}

  async findAllByFamily(userId: string) {
    const familyId = await this.profiles.getFamilyId(userId);
    const db = this.supabase.getClient();

    const { data, error } = await db
      .from('stores')
      .select('*')
      .eq('family_id', familyId)
      .order('name');

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async create(userId: string, name: string, icon: string) {
    const familyId = await this.profiles.getFamilyId(userId);
    const db = this.supabase.getClient();
    const trimmedName = name.trim();

    if (!trimmedName) {
      throw new BadRequestException('El nombre es requerido');
    }

    const { data, error } = await db
      .from('stores')
      .insert({ name: trimmedName, icon, family_id: familyId })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async update(
    userId: string,
    storeId: string,
    updates: { name?: string; icon?: string },
  ) {
    const familyId = await this.profiles.getFamilyId(userId);
    await this.verifyOwnership(storeId, familyId);

    const db = this.supabase.getClient();
    const cleanUpdates: Record<string, string> = {};
    if (updates.name?.trim()) cleanUpdates.name = updates.name.trim();
    if (updates.icon) cleanUpdates.icon = updates.icon;

    const { data, error } = await db
      .from('stores')
      .update(cleanUpdates)
      .eq('id', storeId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async remove(userId: string, storeId: string) {
    const familyId = await this.profiles.getFamilyId(userId);
    await this.verifyOwnership(storeId, familyId);

    const db = this.supabase.getClient();
    const { error } = await db.from('stores').delete().eq('id', storeId);

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { success: true };
  }

  async createDefaultStores(familyId: string) {
    const db = this.supabase.getClient();
    const stores = DEFAULT_STORES.map((store) => ({
      ...store,
      family_id: familyId,
    }));

    const { error } = await db.from('stores').insert(stores);

    if (error) {
      throw new BadRequestException(error.message);
    }
  }

  async ensureStoresBelongToFamily(familyId: string, storeIds: string[]) {
    const uniqueStoreIds = [...new Set(storeIds)];

    if (uniqueStoreIds.length === 0) {
      return;
    }

    const db = this.supabase.getClient();
    const { data, error } = await db
      .from('stores')
      .select('id, family_id')
      .in('id', uniqueStoreIds);

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data || data.length !== uniqueStoreIds.length) {
      throw new BadRequestException('Una o más tiendas no existen');
    }

    const invalidStore = data.find((store) => store.family_id !== familyId);
    if (invalidStore) {
      throw new ForbiddenException(
        'Una o más tiendas no pertenecen a tu familia',
      );
    }
  }

  private async verifyOwnership(storeId: string, familyId: string) {
    const db = this.supabase.getClient();

    const { data } = await db
      .from('stores')
      .select('family_id')
      .eq('id', storeId)
      .single();

    if (!data) {
      throw new NotFoundException('Tienda no encontrada');
    }

    if (data.family_id !== familyId) {
      throw new ForbiddenException('No tienes acceso a esta tienda');
    }
  }
}
