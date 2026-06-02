import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listAppointments, cancelAppointment, completeAppointment } from '../services/appointmentService';
import { formatDateTimeBR } from '../utils/formatUtils';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

const ETAPAS_NOVO = ['Interessado', 'Triagem', 'Agendamento'];

function TagFunil({ etapa }) {
  if (ETAPAS_NOVO.includes(etapa)) return <span className="text-xs text-gray-400">Novo paciente</span>;
  return <span className="text-xs text-gray-500">{etapa}</span>;
}

function TagRecorrencia({ tipo }) {
  if (!tipo) return null;
  const label = { semanal: 'Semanal', quinzenal: 'Quinzenal', mensal: 'Mensal' }[tipo];
  return <span className="text-xs text-gray-400">{label}</span>;
}

const STATUS_OPCOES = [
  { value: 'scheduled', label: 'Agendadas' },
  { value: 'completed', label: 'Realizadas' },
  { value: 'cancelled', label: 'Canceladas' },
];

export default function AgendaPage() {
  const navigate = useNavigate();
  const [consultas, setConsultas]       = useState([]);
  const [dataInicio, setDataInicio]     = useState('');
  const [dataFim, setDataFim]           = useState('');
  const [statusFiltro, setStatusFiltro] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [erro, setErro]                 = useState('');
  const [cancelModal, setCancelModal]   = useState(null);

  async function carregar() {
    setLoading(true); setErro('');
    try {
      const params = {};
      if (dataInicio) params.dataInicio = dataInicio;
      if (dataFim)    params.dataFim    = dataFim;
      if (statusFiltro.length > 0) params.status = statusFiltro.join(',');
      const { data: res } = await listAppointments(params);
      setConsultas(res);
    } catch { setErro('Erro ao carregar agenda.'); }
    finally  { setLoading(false); }
  }

  useEffect(() => { carregar(); }, [dataInicio, dataFim, statusFiltro]);

  function toggleStatus(val) {
    setStatusFiltro(prev =>
      prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]
    );
  }

  function limparFiltros() {
    setDataInicio('');
    setDataFim('');
    setStatusFiltro([]);
  }

  function handleCancelarClick(c) {
    if (c.recorrencia_id) setCancelModal({ id: c.id, recorrencia_id: c.recorrencia_id });
    else executarCancelamento(c.id, 'one');
  }

  async function executarCancelamento(id, scope) {
    setCancelModal(null);
    try { await cancelAppointment(id, scope); await carregar(); }
    catch { setErro('Erro ao cancelar.'); }
  }

  async function handleConcluir(id) {
    try { await completeAppointment(id); await carregar(); }
    catch { setErro('Erro ao atualizar.'); }
  }

  const temFiltro = dataInicio || dataFim || statusFiltro.length > 0;

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Agenda</h2>
          <p className="text-sm text-gray-400 mt-0.5">{consultas.length} consulta(s)</p>
        </div>
        <Link to="/appointments/new" className="btn-primary">+ Nova consulta</Link>
      </div>

      <Alert type="error" message={erro} />

      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20" onClick={() => setCancelModal(null)} />
          <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm p-5 max-w-sm w-full">
            <h3 className="text-sm font-medium text-gray-800 mb-1">Cancelar consulta</h3>
            <p className="text-xs text-gray-400 mb-4">Esta consulta faz parte de uma série recorrente.</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => executarCancelamento(cancelModal.id, 'one')}
                className="btn-secondary justify-center text-sm">Cancelar somente esta</button>
              <button onClick={() => executarCancelamento(cancelModal.id, 'all')}
                className="btn-secondary justify-center text-sm text-gray-500">Cancelar todas as futuras</button>
              <button onClick={() => setCancelModal(null)}
                className="btn-ghost justify-center text-xs text-gray-400 mt-1">Voltar</button>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="card p-4 mb-5">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="label">Data inicial</label>
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="input w-auto" />
          </div>
          <div>
            <label className="label">Data final</label>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="input w-auto" />
          </div>
          <div>
            <label className="label">Status</label>
            <div className="flex gap-2">
              {STATUS_OPCOES.map(s => (
                <button key={s.value} onClick={() => toggleStatus(s.value)}
                  className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                    statusFiltro.includes(s.value)
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          {temFiltro && (
            <button onClick={limparFiltros} className="btn-ghost text-sm text-gray-400 mb-0.5">
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {loading ? <Spinner /> : consultas.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 mb-4">Nenhuma consulta encontrada.</p>
          <Link to="/appointments/new" className="btn-primary">Agendar consulta</Link>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                {['Data e hora', 'Paciente', 'Etapa', 'Recorrência', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {consultas.map(c => (
                <tr key={c.id} onClick={() => navigate(`/appointments/${c.id}/edit`)} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDateTimeBR(c.scheduled_at)}</td>
                  <td className="px-4 py-3">
                    <Link to={`/patients/${c.patient_id}`} className="font-medium text-gray-900 hover:text-brand-600">
                      {c.patient_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3"><TagFunil etapa={c.funil_etapa} /></td>
                  <td className="px-4 py-3"><TagRecorrencia tipo={c.recorrencia_tipo} /></td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-3 justify-end">
                      <button onClick={() => navigate(`/appointments/${c.id}/edit`)}
                        className="text-xs text-gray-400 hover:text-brand-600">Editar</button>
                      {c.status === 'scheduled' && (
                        <>
                          <button onClick={e => { e.stopPropagation(); handleConcluir(c.id); }}
                            className="text-xs text-green-600 hover:text-green-700 font-medium">Realizada</button>
                          <button onClick={e => { e.stopPropagation(); handleCancelarClick(c); }}
                            className="text-xs text-red-500 hover:text-red-700">Cancelar</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
