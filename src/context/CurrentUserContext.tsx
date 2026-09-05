import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CurrentUser {
  id: string | null;
  email: string | null;
  name: string | null;
  role: string | null;
  avatarUrl: string | null;
}

interface CurrentUserValue extends CurrentUser {
  isReady: boolean;
}

const EMPTY: CurrentUserValue = {
  id: null,
  email: null,
  name: null,
  role: null,
  avatarUrl: null,
  isReady: false,
};

const Ctx = createContext<CurrentUserValue>(EMPTY);

/**
 * Resolves the signed-in user, preferring a `user_settings` profile row when
 * one exists and falling back to Supabase `user_metadata`, then the account
 * email. Never stubbed.
 */
export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CurrentUserValue>(EMPTY);

  useEffect(() => {
    let cancelled = false;

    async function resolve(userId?: string) {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (!u) {
        if (!cancelled) setState({ ...EMPTY, isReady: true });
        return;
      }

      const m = (u.user_metadata ?? {}) as Record<string, unknown>;
      let name =
        (m.full_name as string) ?? (m.name as string) ?? u.email ?? null;
      let avatarUrl =
        (m.avatar_url as string) ?? (m.picture as string) ?? null;
      const role =
        (m.job_title as string) ?? (m.role as string) ?? (m.title as string) ?? null;

      const { data: profile } = await supabase
        .from('user_settings')
        .select('display_name, avatar_url')
        .eq('user_id', userId ?? u.id)
        .maybeSingle();

      if (profile?.display_name) name = profile.display_name;
      if (profile?.avatar_url) avatarUrl = profile.avatar_url;

      if (cancelled) return;
      setState({
        id: u.id,
        email: u.email ?? null,
        name,
        role,
        avatarUrl,
        isReady: true,
      });
    }

    void resolve();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) void resolve(session.user.id);
      else setState({ ...EMPTY, isReady: true });
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export function useCurrentUser(): CurrentUserValue {
  return useContext(Ctx);
}
