
'use client';

import { useEffect, useState, Fragment } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, AlertCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

type ProgramRequest = {
    id: string;
    program_type: string;
    institution_name?: string;
    responsible_person?: string;
    student_count?: number;
    address?: string;
    status: string;
    created_at: string;
    additional_info?: string;
    chat_id?: string;
    user_name?: string;
    live_chat_url?: string;
};

const PROGRAM_STATUSES = [
    'Pendiente',
    'Contactado',
    'Agendado',
    'Cerrado'
];

export default function ProgramasPage() {
    const [requests, setRequests] = useState<ProgramRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    useEffect(() => {
        fetchRequests(true);

        const intervalId = setInterval(() => {
            fetchRequests(false);
        }, 30000);

        return () => clearInterval(intervalId);
    }, []);

    async function fetchRequests(showLoading = true) {
        try {
            if (showLoading) setLoading(true);
            const { data, error } = await supabase
                .from('program_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data || []);
            setLastUpdated(new Date());
        } catch (err: any) {
            setError(err.message);
        } finally {
            if (showLoading) setLoading(false);
        }
    }

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            setUpdatingId(id);
            const { error } = await supabase
                .from('program_requests')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            // Optimistic update
            setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
        } catch (err: any) {
            console.error('Error updating status:', err);
            alert('Error updating status: ' + err.message);
        } finally {
            setUpdatingId(null);
        }
    };

    const toggleRow = (id: string) => {
        setExpandedRowId(expandedRowId === id ? null : id);
    };

    const getProgramBadge = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'separa':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'educa':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'transforma':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pendiente':
                return 'bg-yellow-100 text-yellow-800';
            case 'contactado':
                return 'bg-emerald-100 text-emerald-800';
            case 'agendado':
                return 'bg-blue-100 text-blue-800';
            case 'cerrado':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };

    if (loading) return <Loader2 className="mx-auto mt-10 h-8 w-8 animate-spin text-emerald-600" />;
    if (error) return <div className="mx-auto mt-10 text-red-600">Error: {error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-white">Solicitudes de Programas</h2>
                    {lastUpdated && (
                        <p className="text-xs text-emerald-100/80 flex items-center gap-1 mt-1">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            Actualizado: {lastUpdated.toLocaleTimeString()}
                        </p>
                    )}
                </div>
                <span className="text-sm text-gray-500">Total: {requests.length}</span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Programa</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Usuario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Chat ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Ver más</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {requests.map((req) => (
                            <Fragment key={req.id}>
                                <tr
                                    className={cn(
                                        "cursor-pointer transition-colors hover:bg-gray-50",
                                        expandedRowId === req.id && "bg-gray-50"
                                    )}
                                    onClick={() => toggleRow(req.id)}
                                >
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                        {format(new Date(req.created_at), 'dd MMM HH:mm', { locale: es })}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                        <span className={cn('rounded-full border px-2 py-1 text-xs font-semibold', getProgramBadge(req.program_type))}>
                                            {req.program_type?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {req.user_name || 'Anónimo'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-mono text-xs">
                                        {req.live_chat_url ? (
                                            <a
                                                href={req.live_chat_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 hover:text-emerald-600 hover:underline"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {req.chat_id}
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        ) : (
                                            <span>{req.chat_id || '-'}</span>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                        {/* Status Dropdown */}
                                        <div className="relative inline-block">
                                            <select
                                                value={req.status}
                                                onChange={(e) => updateStatus(req.id, e.target.value)}
                                                disabled={updatingId === req.id}
                                                className={cn(
                                                    "appearance-none cursor-pointer rounded-full px-3 py-1 pr-8 text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 disabled:opacity-50",
                                                    getStatusBadge(req.status)
                                                )}
                                            >
                                                {PROGRAM_STATUSES.map((status) => (
                                                    <option key={status} value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                            {updatingId === req.id ? (
                                                <Loader2 className="absolute right-2 top-1.5 h-3 w-3 animate-spin text-emerald-600" />
                                            ) : (
                                                <ChevronDown className="absolute right-2 top-1.5 h-3 w-3 opacity-50 pointer-events-none" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                                        {expandedRowId === req.id ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
                                    </td>
                                </tr>
                                {expandedRowId === req.id && (
                                    <tr className="bg-gray-50">
                                        <td colSpan={6} className="px-6 py-4">
                                            <div className="grid grid-cols-1 gap-4 rounded-md border border-gray-200 bg-white p-4 text-sm sm:grid-cols-2">
                                                <div>
                                                    <p className="font-semibold text-gray-700">Detalles del Solicitante</p>
                                                    <ul className="mt-2 space-y-1 text-gray-600">
                                                        <li><span className="font-medium">Institución:</span> {req.institution_name || '-'}</li>
                                                        <li><span className="font-medium">Responsable:</span> {req.responsible_person || '-'}</li>
                                                        <li><span className="font-medium">Alumnos:</span> {req.student_count || 0}</li>
                                                        <li><span className="font-medium">Dirección:</span> {req.address || '-'}</li>
                                                    </ul>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-700">Información Adicional</p>
                                                    <div className="mt-2 text-gray-600 whitespace-pre-wrap">
                                                        {req.additional_info || 'Sin información adicional.'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}
                        {requests.length === 0 && (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-gray-500">No hay solicitudes recientes.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
