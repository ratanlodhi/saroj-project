import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const ADMIN_EMAIL = 'admin@sarojprakashbandi.com';
const ADMIN_PASSWORD = 'admin@123';
const ADMIN_NAME = 'Admin';

const sanitizeAuthInput = (value: string) =>
  value
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .replace(/^["'`\u201C\u201D\u2018\u2019]+|["'`\u201C\u201D\u2018\u2019]+$/g, '');

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const ONE_HOUR_MS = 60 * 60 * 1000;

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> => {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleResolved, setRoleResolved] = useState(false);

  useEffect(() => {
    const loadingSafetyTimer = setTimeout(() => {
      console.warn('Auth loading safety timer triggered - releasing loading state');
      setLoading(false);
    }, 5000);

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Ensure profile exists for authenticated user
        if (session?.user) {
          setRoleResolved(false);

          // Create profile if needed (fire and forget)
          (async () => {
            const { data, error } = await supabase.from('profiles').select('id').eq('id', session.user.id).maybeSingle();

            if (error) {
              // Avoid insert attempts when profile read itself fails due temporary DB policy issues.
              console.error('Failed to read profile', error);
              return;
            }

            if (!data) {
              // Profile doesn't exist, create it
              // NOTE: This requires RLS policy allowing users to insert their own profiles
              const { error: insertError } = await supabase.from('profiles').upsert({
                id: session.user.id,
                email: session.user.email || '',
                display_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User'
              }, { onConflict: 'id' });

              if (insertError) {
                // Ignore unique constraint violation (23505) and RLS policy violations (42501)
                if (insertError.code !== '23505' && insertError.code !== '42501') {
                  console.error('Failed to create profile', insertError);
                }
              }
            }
          })();

          // Do not block the whole app on role check.
          setLoading(false);
          checkAdminRole(session.user.id, session.user.email).finally(() => {
            setRoleResolved(true);
          });
        } else {
          setIsAdmin(false);
          setRoleResolved(true);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    (async () => {
      try {
        const { data: { session } } = await withTimeout(
          supabase.auth.getSession(),
          ONE_HOUR_MS,
          'auth.getSession'
        );

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setRoleResolved(false);
          checkAdminRole(session.user.id, session.user.email).finally(() => {
            setRoleResolved(true);
          });
        } else {
          setIsAdmin(false);
          setRoleResolved(true);
        }
      } catch (err) {
        console.error('Initial session check failed/timed out', err);
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setRoleResolved(true);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      clearTimeout(loadingSafetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const checkAdminRole = async (userId: string, userEmail?: string | null) => {
    // Clear first so the UI never shows admin affordances from a previous session/user
    // while this check is in flight (or if the user is not an admin).
    setIsAdmin(false);

    if (userEmail?.toLowerCase() === ADMIN_EMAIL) {
      setIsAdmin(true);
      return;
    }

    try {
      const { data: rpcHasRole, error: rpcError } = await withTimeout(
        supabase.rpc('has_role', { _role: 'admin', _user_id: userId }),
        ONE_HOUR_MS,
        'checkAdminRole.rpc.has_role'
      );

      if (!rpcError && rpcHasRole === true) {
        setIsAdmin(true);
        return;
      }

      const { data, error } = await withTimeout(
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle(),
        ONE_HOUR_MS,
        'checkAdminRole'
      );

      if (!error && data) {
        setIsAdmin(true);
        return;
      }

      setIsAdmin(false);
    } catch (err) {
      console.error('Admin role check failed/timed out', err);
      setIsAdmin(false);
    }
  };

  const normalizeAuthError = (error: unknown, fallbackMessage: string) => {
    const rawMessage = error instanceof Error ? error.message : '';

    if (
      rawMessage.includes('Failed to fetch') ||
      rawMessage.includes('ERR_CONNECTION_TIMED_OUT') ||
      rawMessage.includes('NetworkError')
    ) {
      return new Error('Unable to reach Supabase auth server. Check internet, VPN/firewall, or Supabase status, then try again.');
    }

    if (rawMessage) {
      return new Error(rawMessage);
    }

    return new Error(fallbackMessage);
  };

  const signIn = async (email: string, password: string) => {
    try {
      const normalizedEmail = sanitizeAuthInput(email).toLowerCase();
      const normalizedPassword = sanitizeAuthInput(password);

      if (!isValidEmail(normalizedEmail)) {
        return { error: new Error('Please enter a valid email address') };
      }

      if (!normalizedPassword) {
        return { error: new Error('Please enter a password') };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: normalizedPassword,
      });

      if (
        error &&
        error.message.includes('Invalid login credentials') &&
        normalizedEmail === ADMIN_EMAIL &&
        normalizedPassword === ADMIN_PASSWORD
      ) {
        // Bootstrap the admin account on first login when it does not exist yet.
        const { error: signUpError } = await supabase.auth.signUp({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: ADMIN_NAME,
            },
          },
        });

        if (signUpError && !signUpError.message.includes('User already registered')) {
          return { error: normalizeAuthError(signUpError, 'Admin bootstrap sign up failed') };
        }

        const { error: retrySignInError } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: normalizedPassword,
        });

        return { error: retrySignInError ? normalizeAuthError(retrySignInError, 'Sign in failed') : null };
      }

      return { error: error ? normalizeAuthError(error, 'Sign in failed') : null };
    } catch (error) {
      return { error: normalizeAuthError(error, 'Sign in failed') };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const normalizedEmail = sanitizeAuthInput(email).toLowerCase();
      const normalizedPassword = sanitizeAuthInput(password);
      const normalizedName = fullName ? sanitizeAuthInput(fullName) : undefined;

      if (!isValidEmail(normalizedEmail)) {
        return { error: new Error('Please enter a valid email address') };
      }

      if (!normalizedPassword) {
        return { error: new Error('Please enter a password') };
      }

      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: normalizedPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: normalizedName,
          },
        }
      });

      return { error: error ? normalizeAuthError(error, 'Sign up failed') : null };
    } catch (error) {
      return { error: normalizeAuthError(error, 'Sign up failed') };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });
      return { error: error ? normalizeAuthError(error, 'Google sign in failed') : null };
    } catch (error) {
      return { error: normalizeAuthError(error, 'Google sign in failed') };
    }
  };

  const signInWithFacebook = async () => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: redirectUrl,
        },
      });
      return { error: error ? normalizeAuthError(error, 'Facebook sign in failed') : null };
    } catch (error) {
      return { error: normalizeAuthError(error, 'Facebook sign in failed') };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error ? normalizeAuthError(error, 'Sign out failed') : null };
    } catch (error) {
      return { error: normalizeAuthError(error, 'Sign out failed') };
    }
  };

  return {
    user,
    session,
    loading,
    isAdmin,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    roleResolved,
  };
}
