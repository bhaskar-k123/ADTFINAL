import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  session: Session | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, rollNumber: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  loading: true,
  setSession: (session) => set({ session }),

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  },

  signUp: async (email, password, rollNumber) => {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) throw signUpError;

  const user = signUpData.user;
  if (!user) throw new Error("User was not returned from signUp");

  console.log("✅ User signed up:", user.id);

  // Insert profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([{ id: user.id, roll_number: rollNumber }]);

  if (profileError) {
    console.error("❌ Failed to insert profile:", profileError);
    await supabase.auth.admin.deleteUser(user.id); // if using service key
    throw profileError;
  }

  console.log("✅ Profile created for user:", user.id);
},
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ session: null });
  },
}));
