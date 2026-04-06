import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../services/dashboardService';
import { concluirTarefa } from '../services/tarefaService';
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

  async function carregar() {
    try {
      const { data } = await getDashboard();
      setDados(data);
    } catch { setErro('Não foi possível carregar o dashboard.'); }
    finally  { setLoading(false); }
  }

  useEffect(() => { carregar(); }, []);

  useEffect(() => {
    if (!dados?.graficoPorMes?.length || !chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const labels     = dados.graficoPorMes.map(m => m.mes);
    const realizadas = dados.graficoPorMes.map(m => parseInt(m.realizadas));
    const agendadas  = dados.graficoPorMes.map(m => parseInt(m.agendadas));

    chartInstance.current = new window.Chart(chartRef.current.getContext('2d'), {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Realizadas', data: realizadas, backgroundColor: 'rgba(13,148,136,0.7)', borderColor: '#0d9488', borderWidth: 1, borderRadius: 4 },
          { label: 'Agendadas',  data: agendadas,  backgroundColor: 'rgba(13,148,136,0.2)', borderColor: '#0d9488', borderWidth: 1, borderRadius: 4 },
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

  async function handleConcluirTarefa(id) {
    try {
      await concluirTarefa(id);
      setDados(prev => ({ ...prev, tarefas: prev.tarefas.filter(t => t.id !== id) }));
    } catch { setErro('Erro ao concluir tarefa.'); }
  }

  if (loading) return <Spinner />;

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  const c = dados?.contadores || {};

  return (
    <div className="max-w-6xl">
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-gray-900">
          {saudacao}, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <Alert type="error" message={erro} />

      {/* Tarefas pendentes */}
      {dados?.tarefas?.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-amber-800 text-sm mb-3">
            ⚠ Tarefas pendentes ({dados.tarefas.length})
          </h3>
          <div className="space-y-2">
            {dados.tarefas.map(t => (
              <div key={t.id} className="flex items-center justify-between gap-3 bg-white rounded-lg px-4 py-2.5 border border-amber-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{t.tipo === 'prontuario' ? '📋' : '📞'}</span>
                  <p className="text-sm text-gray-700">{t.titulo}</p>
                </div>
                <button onClick={() => handleConcluirTarefa(t.id)}
                  className="text-xs text-green-600 hover:text-green-700 font-medium flex-shrink-0">
                  ✓ Concluir
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Agendadas no mês',  valor: c.agendadas  || 0, icon: '📅', cor: 'bg-brand-50',  acento: 'bg-brand-500' },
          { label: 'Realizadas no mês', valor: c.realizadas || 0, icon: '✓',  cor: 'bg-green-50',  acento: 'bg-green-500' },
          { label: 'Consultas hoje',    valor: c.hoje       || 0, icon: '🕐', cor: 'bg-blue-50',   acento: 'bg-blue-500'  },
          { label: 'Esta semana',       valor: c.semana     || 0, icon: '📆', cor: 'bg-purple-50', acento: 'bg-purple-500'},
        ].map(item => (
          <div key={item.label} className="stat-card">
            <div className={`stat-icon ${item.cor}`}>
              <span>{item.icon}</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{item.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-0.5">{item.valor}</p>
            </div>
            <div className={`absolute top-0 left-0 right-0 h-1 ${item.acento} rounded-t-xl`} />
          </div>
        ))}
      </div>

      {/* Gráfico + Próximas consultas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">Consultas nos últimos 6 meses</h3>
          {dados?.graficoPorMes?.length ? (
            <canvas ref={chartRef} height={120} />
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">Nenhum dado disponível ainda.</p>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Próximas</h3>
            <Link to="/agenda" className="text-xs text-brand-600 hover:text-brand-700 font-medium">Ver agenda →</Link>
          </div>
          {!dados?.proximasConsultas?.length ? (
            <p className="text-sm text-gray-400 text-center py-6">Nenhuma agendada.</p>
          ) : (
            <div className="space-y-2">
              {dados.proximasConsultas.map(c => (
                <div key={c.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700 flex-shrink-0">
                    {c.patient_name?.charAt(0).toUpperCase()}
                  </div>
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
          <h3 className="font-semibold text-gray-900">Últimos atendimentos</h3>
          <Link to="/pipeline" className="text-xs text-brand-600 hover:text-brand-700 font-medium">Ver pipeline →</Link>
        </div>
        {!dados?.ultimosAtendimentos?.length ? (
          <p className="text-sm text-gray-400 text-center py-4">Nenhum atendimento realizado ainda.</p>
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
