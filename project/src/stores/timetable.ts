import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type TimetableEntry = Database['public']['Tables']['timetable_entries']['Row'];
type TimetableEntryInsert = Database['public']['Tables']['timetable_entries']['Insert'];

interface TimetableState {
  entries: TimetableEntry[];
  loading: boolean;
  error: string | null;
  fetchEntries: () => Promise<void>;
  createEntry: (entry: Omit<TimetableEntryInsert, 'user_id'>) => Promise<void>;
  updateEntry: (id: string, entry: Partial<TimetableEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}

export const useTimetableStore = create<TimetableState>((set, get) => ({
  entries: [],
  loading: false,
  error: null,

  fetchEntries: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('timetable_entries')
        .select(`
          *,
          subject:subjects(
            id,
            name,
            type
          )
        `)
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;
      set({ entries: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  createEntry: async (entry) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('timetable_entries')
        .insert([{ ...entry, user_id: user.id }]);

      if (error) throw error;
      await get().fetchEntries();
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  updateEntry: async (id, entry) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('timetable_entries')
        .update(entry)
        .eq('id', id);

      if (error) throw error;
      await get().fetchEntries();
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  deleteEntry: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('timetable_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await get().fetchEntries();
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));