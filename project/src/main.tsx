import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase } from './lib/supabase';
import { useAuthStore } from './stores/auth';
import App from './App.tsx';
import './index.css';

// Initialize auth state
supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.getState().setSession(session);
});

// Listen for auth changes
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);