'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

export function AppShell({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        // Skip auth check on the login page
        if (isLoginPage) return;

        // Check current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                router.push('/login');
            } else {
                setUser(session.user);
            }
            setChecking(false);
        });

        // Listen for auth changes (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                router.push('/login');
                setUser(null);
            } else {
                setUser(session.user);
            }
        });

        return () => subscription.unsubscribe();
    }, [router, isLoginPage]);

    // If we are on the login page, render children directly
    // (no sidebar, no header, no auth check)
    if (isLoginPage) {
        return <>{children}</>;
    }

    // Show spinner while verifying session
    if (checking) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-900">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
        );
    }

    // If no user, don't render the shell (redirect is in progress)
    if (!user) return null;

    return (
        <div className="flex h-full">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header
                    onMenuClick={() => setSidebarOpen(true)}
                    userEmail={user.email ?? ''}
                />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
