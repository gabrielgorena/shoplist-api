import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';
import { ProfilesService } from '../profiles/profiles.service.js';
import { Priority } from './dto/create-item.dto.js';

interface QueryOptions {
  storeId?: string;
  priority?: Priority;
  showBought?: boolean;
}

@Injectable()
export class ItemsService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly profiles: ProfilesService,
  ) {}

  async findAll(userId: string, options: QueryOptions) {
    const familyId = await this.profiles.getFamilyId(userId);
    const db = this.supabase.getClient();

    let query = db
      .from('items')
      .select(`
        *,
        item_stores(store_id, stores:stores(id, name, icon)),
        profiles:created_by(name),
        bought_by_profile:bought_by(name)
      `)
      .eq('family_id', familyId)
      .order('is_bought', { ascending: true })
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false });

    if (!options.showBought) {
      query = query.eq('is_bought', false);
    }

    if (options.priority) {
      query = query.eq('priority', options.priority);
    }

    const { data: items, error } = await query;

    if (error) {
      throw new BadRequestException(error.message);
    }

    // Filter by store in memory (many-to-many join limitation)
    let result = items ?? [];
    if (options.storeId) {
      result = result.filter((item: { item_stores?: { store_id: string }[] }) =>
        item.item_stores?.some((is) => is.store_id === options.storeId),
      );
    }

    return result;
  }

  async create(
    userId: string,
    data: {
      name: string;
      quantity?: number;
      unit?: string;
      notes?: string;
      priority?: Priority;
      store_ids?: string[];
    },
  ) {
    const familyId = await this.profiles.getFamilyId(userId);
    const db = this.supabase.getClient();

    const { data: item, error } = await db
      .from('items')
      .insert({
        name: data.name.trim(),
        quantity: data.quantity ?? 1,
        unit: data.unit ?? null,
        notes: data.notes ?? null,
        priority: data.priority ?? 'medium',
        family_id: familyId,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (data.store_ids?.length) {
      const itemStores = data.store_ids.map((store_id) => ({
        item_id: item.id,
        store_id,
      }));

      const { error: storeError } = await db.from('item_stores').insert(itemStores);

      if (storeError) {
        throw new BadRequestException(storeError.message);
      }
    }

    return item;
  }

  async update(
    userId: string,
    itemId: string,
    data: {
      name?: string;
      quantity?: number;
      unit?: string;
      notes?: string;
      priority?: Priority;
      is_bought?: boolean;
      store_ids?: string[];
    },
  ) {
    const familyId = await this.profiles.getFamilyId(userId);
    await this.verifyOwnership(itemId, familyId);

    const db = this.supabase.getClient();
    const { store_ids, ...itemUpdates } = data;

    // Handle bought_by when toggling is_bought
    const updates: Record<string, unknown> = { ...itemUpdates };
    if (updates.is_bought === true) {
      updates.bought_by = userId;
    } else if (updates.is_bought === false) {
      updates.bought_by = null;
    }

    // Clean undefined values
    Object.keys(updates).forEach((key) => {
      if (updates[key] === undefined) delete updates[key];
    });

    const { data: item, error } = await db
      .from('items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    // Update store associations if provided
    if (store_ids !== undefined) {
      await db.from('item_stores').delete().eq('item_id', itemId);

      if (store_ids.length > 0) {
        await db.from('item_stores').insert(
          store_ids.map((store_id) => ({ item_id: itemId, store_id })),
        );
      }
    }

    return item;
  }

  async remove(userId: string, itemId: string) {
    const familyId = await this.profiles.getFamilyId(userId);
    await this.verifyOwnership(itemId, familyId);

    const db = this.supabase.getClient();
    const { error } = await db.from('items').delete().eq('id', itemId);

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { success: true };
  }

  private async verifyOwnership(itemId: string, familyId: string) {
    const db = this.supabase.getClient();

    const { data } = await db
      .from('items')
      .select('family_id')
      .eq('id', itemId)
      .single();

    if (!data) {
      throw new NotFoundException('Item no encontrado');
    }

    if (data.family_id !== familyId) {
      throw new ForbiddenException('No tienes acceso a este item');
    }
  }
}
