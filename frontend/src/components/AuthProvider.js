import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../utils/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and sets the user
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        };

        getSession();

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email) => {
        if (email !== 'cvarunkumar455@gmail.com') {
            throw new Error('Access Denied: You are not an admin.');
        }

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin + '/admin',
            },
        });
        if (error) throw error;
    };

    const loginWithPassword = async (email, password) => {
        if (email !== 'cvarunkumar455@gmail.com') {
            throw new Error('Access Denied: You are not an admin.');
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
    };

    const sendPasswordReset = async (email) => {
        if (email !== 'cvarunkumar455@gmail.com') {
            throw new Error('Access Denied: You are not an admin.');
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/update-password',
        });
        if (error) throw error;
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    const isAdmin = user?.email === 'cvarunkumar455@gmail.com';

    return (
        <AuthContext.Provider value={{ user, session, login, loginWithPassword, sendPasswordReset, logout, isAdmin, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
