import type { Session, User } from '@supabase/supabase-js';
import {
  createContext,
  type PropsWithChildren,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState, Platform } from 'react-native';
import { supabase } from '@/services/supabase';

// auth-provider

export type AuthState =
  | { readonly status: 'unconfigured' }
  | { readonly status: 'loading' }
  | { readonly status: 'signed_out' }
  | { readonly status: 'signed_in'; readonly session: Session; readonly user: User };

interface SignUpInput {
  readonly email: string;
  readonly password: string;
  readonly fullName: string;
}

interface AuthActionResult {
  readonly requiresEmailConfirmation: boolean;
}

interface AuthContextValue {
  readonly state: AuthState;
  readonly signIn: (email: string, password: string) => Promise<void>;
  readonly signUp: (input: SignUpInput) => Promise<AuthActionResult>;
  readonly signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function stateFromSession(session: Session | null): AuthState {
  return session === null
    ? { status: 'signed_out' }
    : { status: 'signed_in', session, user: session.user };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>(
    supabase === null ? { status: 'unconfigured' } : { status: 'loading' },
  );

  useEffect(() => {
    if (supabase === null) {
      return;
    }

    const client = supabase;
    let active = true;

    void client.auth.getSession().then(({ data, error }) => {
      if (!active) {
        return;
      }

      setState(error === null ? stateFromSession(data.session) : { status: 'signed_out' });
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setState(stateFromSession(session));
      }
    });

    const appStateSubscription =
      Platform.OS === 'web'
        ? undefined
        : AppState.addEventListener('change', (nextState) => {
            if (nextState === 'active') {
              client.auth.startAutoRefresh();
            } else {
              client.auth.stopAutoRefresh();
            }
          });

    if (Platform.OS !== 'web' && AppState.currentState === 'active') {
      client.auth.startAutoRefresh();
    }

    return () => {
      active = false;
      subscription.unsubscribe();
      appStateSubscription?.remove();
      if (Platform.OS !== 'web') {
        client.auth.stopAutoRefresh();
      }
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (supabase === null) {
      throw new Error('Supabase chưa được cấu hình.');
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error !== null) {
      throw error;
    }
  }, []);

  const signUp = useCallback(async (input: SignUpInput): Promise<AuthActionResult> => {
    if (supabase === null) {
      throw new Error('Supabase chưa được cấu hình.');
    }

    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      options: { data: { full_name: input.fullName.trim(), lifestyle_onboarding_pending: true } },
    });

    if (error !== null) {
      throw error;
    }

    return { requiresEmailConfirmation: data.session === null };
  }, []);

  const signOut = useCallback(async () => {
    if (supabase === null) {
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error !== null) {
      throw error;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ state, signIn, signUp, signOut }),
    [signIn, signOut, signUp, state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = use(AuthContext);

  if (value === null) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return value;
}

export function getUserDisplayName(user: User) {
  const metadataName = user.user_metadata.full_name;

  if (typeof metadataName === 'string' && metadataName.trim().length > 0) {
    return metadataName.trim();
  }

  return user.email?.split('@')[0] ?? 'Tài khoản';
}

export function getUserInitials(user: User) {
  return (
    getUserDisplayName(user)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'TK'
  );
}
