import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../services/dashboardService';
import { getUser } from '../utils/authUtils';
import { formatDateTimeBR } from '../utils/formatUtils';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

export default function DashboardPage() {
  const [dados, setDados]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro]       = useState('');
  const chartRef              = useRef(null);
  const chartInstance         = useRef(null);
  const user = getUser();

  useEffect(() => {
    async function carregar() {
      try {
        const { data } = await getDashboard();
        setDados(data);
      } catch { setErro('Não foi possível carregar o dashboard.'); }
      finally  { setLoading(false); }
    }
    carregar();
  }, []);

  useEffect(() => {
    if (!dados?.graficoPorMes?.length || !chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const labels     = dados.graficoPorMes.map(m => m.mes);
    const realizadas = dados.graficoPorMes.map(m => parseInt(m.realizadas) || 0);
    const agendadas  = dados.graficoPorMes.map(m => parseInt(m.agendadas)  || 0);

    chartInstance.current = new window.Chart(chartRef.current.getContext('2d'), {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Realizadas', data: realizadas, backgroundColor: 'rgba(13,148,136,0.75)', borderColor: '#0d9488', borderWidth: 1, borderRadius: 3 },
          { label: 'Agendadas',  data: agendadas,  backgroundColor: 'rgba(13,148,136,0.18)', borderColor: '#0d9488', borderWidth: 1, borderRadius: 3 },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#6b7280', font: { family: 'Inter', size: 12 } } } },
        scales: {
          x: { ticks: { color: '#9ca3af' }, grid: { color: '#f3f4f6' } },
          y: { ticks: { color: '#9ca3af', stepSize: 1 }, grid: { color: '#f3f4f6' }, beginAtZero: true },
        },
      },
    });
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [dados]);

  if (loading) return <Spinner />;

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  const c = dados?.contadores || {};

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {saudacao}, {user?.name?.split(' ')[0]}
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <Alert type="error" message={erro} />

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Agendadas no mês',  valor: c.agendadas  || 0, borda: 'border-t-brand-400'  },
          { label: 'Realizadas no mês', valor: c.realizadas || 0, borda: 'border-t-green-400'  },
          { label: 'Consultas hoje',    valor: c.hoje       || 0, borda: 'border-t-blue-400'   },
          { label: 'Esta semana',       valor: c.semana     || 0, borda: 'border-t-purple-400' },
        ].map(item => (
          <div key={item.label} className={`card border-t-2 ${item.borda}`}>
            <p className="text-xs text-gray-500 font-medium">{item.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{item.valor}</p>
          </div>
        ))}
      </div>

      {/* Gráfico + Próximas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4 text-sm">Consultas — últimos 6 meses</h3>
          {dados?.graficoPorMes?.length ? (
            <canvas ref={chartRef} height={130} />
          ) : (
            <p className="text-sm text-gray-400 text-center py-10">Nenhum dado disponível.</p>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 text-sm">Próximas consultas</h3>
            <Link to="/agenda" className="text-xs text-brand-600 hover:text-brand-700">Ver agenda</Link>
          </div>
          {!dados?.proximasConsultas?.length ? (
            <p className="text-sm text-gray-400 py-4 text-center">Nenhuma agendada.</p>
          ) : (
            <div className="space-y-2">
              {dados.proximasConsultas.map(c => (
                <div key={c.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.patient_name}</p>
                    <p className="text-xs text-gray-400">{formatDateTimeBR(c.scheduled_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Últimos atendimentos */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 text-sm">Últimos atendimentos</h3>
          <Link to="/pipeline" className="text-xs text-brand-600 hover:text-brand-700">Ver pipeline</Link>
        </div>
        {!dados?.ultimosAtendimentos?.length ? (
          <p className="text-sm text-gray-400 text-center py-4">Nenhum atendimento realizado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-400 pb-2 pr-4">Paciente</th>
                <th className="text-left text-xs font-medium text-gray-400 pb-2 pr-4">Data</th>
                <th className="text-left text-xs font-medium text-gray-400 pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {dados.ultimosAtendimentos.map(c => (
                <tr key={c.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2.5 pr-4 font-medium text-gray-800">{c.patient_name}</td>
                  <td className="py-2.5 pr-4 text-gray-400">{formatDateTimeBR(c.scheduled_at)}</td>
                  <td className="py-2.5"><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
