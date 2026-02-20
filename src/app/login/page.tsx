'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, LogIn, Leaf } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError('Credenciales incorrectas. Verificá tu email y contraseña.');
            setLoading(false);
        } else {
            router.push('/');
            router.refresh();
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
            {/* Background subtle pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-400 to-slate-900" />

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 px-8 py-10 text-white text-center">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-white/20 rounded-full p-3">
                                <Leaf className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Secretaría de Ambiente</h1>
                        <p className="text-emerald-200 text-sm mt-1">Panel de Gestión — San Miguel de Tucumán</p>
                    </div>

                    {/* Form */}
                    <div className="px-8 py-10">
                        <h2 className="text-lg font-semibold text-slate-800 mb-6">Iniciar sesión</h2>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Correo electrónico
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                                    placeholder="usuario@ambiente.gob.ar"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Contraseña
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                                    placeholder="••••••••"
                                />
                            </div>

                            {error && (
                                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <LogIn className="h-4 w-4" />
                                )}
                                {loading ? 'Ingresando...' : 'Ingresar'}
                            </button>
                        </form>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs text-slate-500">
                    ¿Necesitás acceso? Contactá al administrador del sistema.
                </p>
            </div>
        </div>
    );
}
