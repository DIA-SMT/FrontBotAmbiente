
import { Menu, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface HeaderProps {
    onMenuClick: () => void;
    userEmail: string;
}

export function Header({ onMenuClick, userEmail }: HeaderProps) {
    const router = useRouter();

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push('/login');
    }

    return (
        <header className="bg-white shadow">
            <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
                <button
                    type="button"
                    className="mr-4 text-slate-500 focus:outline-none lg:hidden"
                    onClick={onMenuClick}
                >
                    <span className="sr-only">Open sidebar</span>
                    <Menu className="h-6 w-6" aria-hidden="true" />
                </button>
                <div className="flex flex-1 items-center justify-between">
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                        Secretaría de Ambiente
                    </h1>
                    <div className="flex items-center gap-3">
                        <span className="hidden sm:block text-sm text-slate-500 truncate max-w-[200px]">
                            {userEmail}
                        </span>
                        <button
                            onClick={handleLogout}
                            title="Cerrar sesión"
                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Salir</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
