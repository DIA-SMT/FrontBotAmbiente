
'use client';

import { useEffect, useState, Fragment } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, AlertCircle, ChevronDown, ChevronUp, MapPin, User, MessageSquare, ExternalLink, CheckCircle } from 'lucide-react'; // Added CheckCircle
import { cn } from '@/lib/utils';

type Ticket = {
    id: string;
    ticket_type: string;
    status: string;
    address: string;
    waste_type?: string;
    quantity?: string;
    days_without_service?: number;
    photo_url?: string;
    created_at: string;
    sla_deadline?: string;
    user_name?: string;
    chat_id?: string;
    live_chat_url?: string;
};

const TICKET_STATUSES = [
    'Pendiente',
    'Pendiente Validación Imagen',
    'Pendiente Verificación GPS',
    'En Proceso',
    'Resuelto',
    'Rechazado'
];

export default function TicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null); // Track which ticket is being updated
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    useEffect(() => {
        fetchTickets(true);

        const intervalId = setInterval(() => {
            fetchTickets(false);
        }, 30000);

        return () => clearInterval(intervalId);
    }, []);

    async function fetchTickets(showLoading = true) {
        try {
            if (showLoading) setLoading(true);
            const { data, error } = await supabase
                .from('tickets')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTickets(data || []);
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
                .from('tickets')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            // Optimistic update
            setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
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

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pendiente':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'pendiente validación imagen':
            case 'pendiente verificación gps':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'en proceso':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'resuelto':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'rechazado':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) return <Loader2 className="mx-auto mt-10 h-8 w-8 animate-spin text-emerald-600" />;
    if (error) return <div className="mx-auto mt-10 text-red-600">Error: {error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-white">Tickets de Soporte</h2>
                    {lastUpdated && (
                        <p className="text-xs text-emerald-100/80 flex items-center gap-1 mt-1">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            Actualizado: {lastUpdated.toLocaleTimeString()}
                        </p>
                    )}
                </div>
                <span className="text-sm text-gray-500">
                    Total: {tickets.length}
                </span>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tipo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Usuario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Chat ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Ver más</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {tickets.map((ticket) => (
                            <Fragment key={ticket.id}>
                                <tr
                                    className={cn(
                                        "cursor-pointer transition-colors hover:bg-gray-50",
                                        expandedRowId === ticket.id && "bg-gray-50"
                                    )}
                                    onClick={() => toggleRow(ticket.id)}
                                >
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                        {format(new Date(ticket.created_at), 'dd MMM HH:mm', { locale: es })}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                        {ticket.ticket_type}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {ticket.user_name || 'Anónimo'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-mono text-xs">
                                        {ticket.live_chat_url ? (
                                            <a
                                                href={ticket.live_chat_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 hover:text-emerald-600 hover:underline"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {ticket.chat_id || 'Chat'}
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        ) : (
                                            <span>{ticket.chat_id || '-'}</span>
                                        )}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                        {/* Status Dropdown */}
                                        <div className="relative inline-block">
                                            <select
                                                value={ticket.status}
                                                onChange={(e) => updateStatus(ticket.id, e.target.value)}
                                                disabled={updatingId === ticket.id}
                                                className={cn(
                                                    "appearance-none cursor-pointer rounded-full border px-3 py-1 pr-8 text-xs font-semibold leading-5 outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 disabled:opacity-50",
                                                    getStatusBadge(ticket.status)
                                                )}
                                            >
                                                {TICKET_STATUSES.map((status) => (
                                                    <option key={status} value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                            {updatingId === ticket.id ? (
                                                <Loader2 className="absolute right-2 top-1.5 h-3 w-3 animate-spin text-emerald-600" />
                                            ) : (
                                                <ChevronDown className="absolute right-2 top-1.5 h-3 w-3 opacity-50 pointer-events-none" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                                        {expandedRowId === ticket.id ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
                                    </td>
                                </tr>
                                {expandedRowId === ticket.id && (
                                    <tr className="bg-gray-50">
                                        <td colSpan={6} className="px-6 py-4">
                                            <div className="rounded-md border border-gray-200 bg-white p-4 text-sm">
                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                    <div>
                                                        <h4 className="mb-2 font-semibold text-gray-700 flex items-center gap-2">
                                                            <MapPin className="h-4 w-4" /> Ubicación y Detalles
                                                        </h4>
                                                        <ul className="space-y-2 text-gray-600">
                                                            <li><span className="font-medium text-gray-900">Dirección:</span> {ticket.address}</li>
                                                            {ticket.ticket_type === 'Retiro Especial' && (
                                                                <>
                                                                    <li><span className="font-medium text-gray-900">Tipo de Residuo:</span> {ticket.waste_type}</li>
                                                                    <li><span className="font-medium text-gray-900">Cantidad:</span> {ticket.quantity}</li>
                                                                </>
                                                            )}
                                                            {ticket.ticket_type === 'Reclamo Recolección' && (
                                                                <li><span className="font-medium text-gray-900">Días sin servicio:</span> {ticket.days_without_service}</li>
                                                            )}
                                                        </ul>
                                                    </div>

                                                    <div>
                                                        <h4 className="mb-2 font-semibold text-gray-700 flex items-center gap-2">
                                                            <User className="h-4 w-4" /> Datos de Contacto
                                                        </h4>
                                                        <ul className="space-y-2 text-gray-600">
                                                            <li><span className="font-medium text-gray-900">Nombre:</span> {ticket.user_name || 'No registrado'}</li>
                                                            <li>
                                                                <span className="font-medium text-gray-900">WhatsApp ID:</span>{' '}
                                                                {ticket.live_chat_url ? (
                                                                    <a
                                                                        href={ticket.live_chat_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1 text-emerald-600 hover:underline"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        {ticket.chat_id || 'Abrir Chat'}
                                                                        <ExternalLink className="h-3 w-3" />
                                                                    </a>
                                                                ) : (
                                                                    <span>{ticket.chat_id || 'No registrado'}</span>
                                                                )}
                                                            </li>
                                                            <li><span className="font-medium text-gray-900">Creado el:</span> {format(new Date(ticket.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}</li>
                                                        </ul>
                                                    </div>
                                                </div>

                                                {ticket.photo_url && (
                                                    <div className="mt-4 border-t pt-4">
                                                        <h4 className="mb-2 font-semibold text-gray-700 flex items-center gap-2">
                                                            <Loader2 className="h-4 w-4" /> Evidencia Fotográfica
                                                        </h4>
                                                        <a
                                                            href={ticket.photo_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-emerald-600 hover:underline text-sm"
                                                        >
                                                            Ver Foto Adjunta
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}
                        {tickets.length === 0 && (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-gray-500">
                                    No hay tickets registrados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
