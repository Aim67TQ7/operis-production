import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { appConfig } from '@/config/app.config';
import { getAuthStorage } from '@/lib/cookieStorage';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  appConfig.supabase.url,
  appConfig.supabase.anonKey,
  {
    auth: {
      storage: getAuthStorage(),
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);
