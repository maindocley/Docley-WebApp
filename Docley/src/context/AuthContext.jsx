import { createContext, useContext, useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import apiClient from '../api/client';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);
    const [serverError, setServerError] = useState(false);

    // Refs for safety
    const lastFetchedId = useRef(null);
    const fetchTimeoutRef = useRef(null);

    const fetchProfile = useCallback(async (userId) => {
        if (!userId) {
            console.log('[Auth] No userId, skipping profile fetch');
            setLoading(false);
            return null;
        }

        // Prevent duplicate fetches for the same ID if we already have it
        if (lastFetchedId.current === userId && profile) {
            setLoading(false);
            return profile;
        }

        try {
            console.log(`[Auth] Fetching profile via API: ${userId}`);
            setProfileLoading(true);
            setServerError(false); // Reset error on retry
            lastFetchedId.current = userId;

            // 10s Safety Timeout
            if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
            fetchTimeoutRef.current = setTimeout(() => {
                if (loading || profileLoading) {
                    console.warn('[Auth] Safety timeout reached. Server likely unreachable.');
                    setLoading(false);
                    setProfileLoading(false);
                    setServerError(true); // Signal server unreachable
                }
            }, 10000);

            // 1. Check Cache
            const cached = sessionStorage.getItem(`profile_${userId}`);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed && Object.prototype.hasOwnProperty.call(parsed, 'is_premium')) {
                    setProfile(parsed);
                    setProfileLoading(false);
                    setLoading(false);
                    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
                    return parsed;
                }
            }

            // 2. Fetch from Backend API via Central Client
            const response = await apiClient.get('/users/profile');
            const data = response.data;

            if (data) {
                setProfile(data);
                sessionStorage.setItem(`profile_${userId}`, JSON.stringify(data));
                if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
                return data;
            }
            return null;
        } catch (error) {
            console.error('[Auth] Profile error:', error);
            setLoading(false);
            setProfileLoading(false);
            // Don't set serverError here yet, let the timeout handle true unreachability
            return null;
        } finally {
            setProfileLoading(false);
            setLoading(false); // CRITICAL: Stop the spinner no matter what
        }
    }, [profile, loading, profileLoading]);
    // fetchProfile itself doesn't depend on profile or loading anymore, as it sets them.

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id, session.access_token);
            } else {
                setLoading(false);
            }
        }).catch(err => {
            console.error('[Auth] Initial session error:', err);
            setLoading(false);
            setProfileLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id, session.access_token).catch(() => {
                    setLoading(false);
                    setProfileLoading(false);
                });
            } else {
                setProfile(null);
                lastFetchedId.current = null; // Reset ref if user logs out
                setLoading(false);
                setProfileLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchProfile]); // fetchProfile is a dependency because it's defined outside and used inside.

    // 2. Computed values using useMemo
    const isAdmin = useMemo(() => {
        // High-confidence role from DB table takes precedence
        return profile?.role === 'admin';
    }, [profile]);

    const isPremium = useMemo(() => {
        return profile?.is_premium === true;
    }, [profile]);

    const isEmailVerified = useMemo(() => {
        return user?.email_confirmed_at != null;
    }, [user]);

    // Sign up with email and password
    const signUp = async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) throw error;
        return data;
    };

    // Sign in with email and password
    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        // Check if email is verified
        if (data.user && !data.user.email_confirmed_at) {
            await supabase.auth.signOut();
            throw new Error('Please verify your email before signing in. Check your inbox for the verification link.');
        }

        return data;
    };

    // Sign in with Google
    const signInWithGoogle = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) throw error;
        return data;
    };

    // Sign out
    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    // Reset password (send reset email)
    const resetPassword = async (email) => {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw error;
        return data;
    };

    // Update password (after clicking reset link)
    const updatePassword = async (newPassword) => {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) throw error;
        return data;
    };

    // Resend verification email
    const resendVerificationEmail = async (email) => {
        const { data, error } = await supabase.auth.resend({
            type: 'signup',
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) throw error;
        return data;
    };

    const value = {
        user,
        session,
        profile,
        loading,
        profileLoading,
        serverError,
        isInitializing: loading, // Backwards compatibility for components using this
        isAuthenticated: !!user,
        isAdmin,
        isPremium,
        isEmailVerified,
        signUp: async (email, password, fullName) => {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
            return data;
        },
        signIn: async (email, password) => {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            if (data.user && !data.user.email_confirmed_at) {
                await supabase.auth.signOut();
                throw new Error('Please verify your email first.');
            }
            return data;
        },
        signInWithGoogle: async () => {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${window.location.origin}/auth/callback` },
            });
            if (error) throw error;
            return data;
        },
        signOut: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        },
        resetPassword: async (email) => {
            const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            return data;
        },
        updatePassword: async (newPassword) => {
            const { data, error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            return data;
        },
        resendVerificationEmail: async (email) => {
            const { data, error } = await supabase.auth.resend({
                type: 'signup',
                email,
                options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
            });
            if (error) throw error;
            return data;
        },
        refreshProfile: () => fetchProfile(user?.id)
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
