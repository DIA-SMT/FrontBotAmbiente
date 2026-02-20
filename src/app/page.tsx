
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Ticket, Users, TrendingUp, AlertCircle, BarChart as BarChartIcon, PieChart as PieChartIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalTickets: 0,
    pendingTickets: 0,
    totalPrograms: 0,
    pendingPrograms: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [ticketStatusData, setTicketStatusData] = useState<any[]>([]);
  const [programTypeData, setProgramTypeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let abortController = new AbortController();
    let isMounted = true;

    async function fetchStats(showLoading = true) {
      // Create a fresh controller each time
      abortController = new AbortController();

      try {
        if (showLoading && isMounted) setLoading(true);

        // Fetch all tickets for aggregation
        const { data: tickets, error: ticketError } = await supabase
          .from('tickets')
          .select('*')
          .abortSignal(abortController.signal);

        // Fetch all programs for aggregation
        const { data: programs, error: programError } = await supabase
          .from('program_requests')
          .select('*')
          .abortSignal(abortController.signal);

        if (!isMounted) return; // Component unmounted, discard results

        if (ticketError) throw ticketError;
        if (programError) throw programError;

        const ticketsList = tickets || [];
        const programsList = programs || [];

        // Calculate Basics
        const pendingTickets = ticketsList.filter(t =>
          t.status === 'Pendiente Validación Imagen' ||
          t.status === 'Pendiente Verificación GPS'
        ).length;
        const pendingPrograms = programsList.filter(p => p.status === 'Pendiente').length;

        setStats({
          totalTickets: ticketsList.length,
          pendingTickets,
          totalPrograms: programsList.length,
          pendingPrograms
        });

        // Prepare Ticket Status Chart Data
        const statusCounts: Record<string, number> = {};
        ticketsList.forEach((t) => {
          const status = t.status || 'Desconocido';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        const ticketChartData = Object.keys(statusCounts).map(key => ({
          name: key,
          count: statusCounts[key]
        }));
        setTicketStatusData(ticketChartData);

        // Prepare Program Type Chart Data
        const programCounts: Record<string, number> = {};
        programsList.forEach((p) => {
          const type = p.program_type || 'Otros';
          programCounts[type] = (programCounts[type] || 0) + 1;
        });
        const programChartData = Object.keys(programCounts).map(key => ({
          name: key.toUpperCase(),
          value: programCounts[key]
        }));
        setProgramTypeData(programChartData);

        setLastUpdated(new Date());

      } catch (error: any) {
        // AbortError is expected when component unmounts - ignore silently
        if (error?.name === 'AbortError' || error?.code === 'PGRST_ABORT') return;
        if (!isMounted) return;
        console.error('Error fetching dashboard data:', error);
        if (isMounted) setError(error.message || 'Error de conexión');
      } finally {
        if (showLoading && isMounted) setLoading(false);
      }
    }

    fetchStats(true); // Initial fetch with loading

    // Auto-refresh every 30 seconds
    const intervalId = setInterval(() => {
      fetchStats(false); // Background fetch without loading
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      abortController.abort();
    };
  }, []);

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div className="text-red-500 font-medium">Error cargando datos: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Panel General</h2>
          {lastUpdated && (
            <p className="text-xs text-emerald-100/80 flex items-center gap-1 mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Actualizado: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Tickets Totales"
          value={stats.totalTickets}
          icon={Ticket}
          trend="Gestionados"
        />
        <StatsCard
          title="Tickets Pendientes"
          value={stats.pendingTickets}
          icon={AlertCircle}
          trend="Requieren atención"
          alert
        />
        <StatsCard
          title="Solicitudes Programas"
          value={stats.totalPrograms}
          icon={Users}
          trend="Acumulado"
        />
        <StatsCard
          title="Programas Pendientes"
          value={stats.pendingPrograms}
          icon={TrendingUp}
          trend="Por contactar"
          alert
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Ticket Status Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Estado de Tickets</h3>
            <BarChartIcon className="h-5 w-5 text-gray-500" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ticketStatusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" name="Tickets" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Program Distribution Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Programas Solicitados</h3>
            <PieChartIcon className="h-5 w-5 text-gray-500" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={programTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {programTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, trend, alert }: any) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={cn("rounded-full p-3", alert ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600")}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className={cn("font-medium", alert ? "text-red-600" : "text-emerald-600")}>
          {trend}
        </span>
      </div>
    </div>
  );
}
