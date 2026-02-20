
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Ticket, Users, Leaf, Settings, LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Tickets', href: '/tickets', icon: Ticket },
    { name: 'Programas', href: '/programas', icon: Users },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sidebar component */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex w-64 transform flex-col bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
                    <Image
                        src="/logo.png"
                        alt="SMT Logo"
                        width={150}
                        height={40}
                        className="h-10 w-auto object-contain"
                        priority
                    />
                </div>
                <nav className="flex-1 space-y-1 px-2 py-4">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-emerald-600 text-white'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        'mr-3 h-5 w-5 flex-shrink-0',
                                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                                    )}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="border-t border-slate-800 p-4">
                    <button className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white">
                        <LogOut className="mr-3 h-5 w-5 text-slate-400 group-hover:text-white" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>

        </>
    );
}
