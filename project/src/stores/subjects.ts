import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Subject = Database['public']['Tables']['subjects']['Row'];
type SubjectInsert = Database['public']['Tables']['subjects']['Insert'];

interface SubjectsState {
  subjects: Subject[];
  loading: boolean;
  error: string | null;
  fetchSubjects: () => Promise<void>;
  createSubject: (subject: Omit<SubjectInsert, 'user_id'>) => Promise<void>;
  updateSubject: (id: string, subject: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
}

export const useSubjectsStore = create<SubjectsState>((set, get) => ({
  subjects: [],
  loading: false,
  error: null,

  fetchSubjects: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;
      set({ subjects: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  createSubject: async (subject) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('subjects')
        .insert([{ ...subject, user_id: user.id }]);

      if (error) throw error;
      await get().fetchSubjects();
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  updateSubject: async (id, subject) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('subjects')
        .update(subject)
        .eq('id', id);

      if (error) throw error;
      await get().fetchSubjects();
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  deleteSubject: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await get().fetchSubjects();
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));