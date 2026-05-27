import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  listAppointments, cancelAppointment, completeAppointment
} from '../services/appointmentService';
import { formatDateTimeBR } from '../utils/formatUtils';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';

const ETAPAS_NOVO = ['Interessado', 'Triagem', 'Agendamento'];
const COR_TAG = {
  'Primeira Sessão':    'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Paciente Ativo':     'bg-green-50 text-green-700 border-green-200',
  'Aguardando Retorno': 'bg-amber-50 text-amber-700 border-amber-200',
  'Alta/Encerrado':     'bg-teal-50 text-teal-700 border-teal-200',
  'Abandono':           'bg-red-50 text-red-700 border-red-200',
};

function TagFunil({ etapa }) {
  if (ETAPAS_NOVO.includes(etapa)) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200">
        Novo paciente
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${COR_TAG[etapa] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {etapa}
    </span>
  );
}

function TagRecorrencia({ tipo }) {
  if (!tipo) return null;
  const label = { semanal: 'Semanal', quinzenal: 'Quinzenal', mensal: 'Mensal' }[tipo];
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
      {label}
    </span>
  );
}

function hoje() { return new Date().toISOString().slice(0, 10); }

export default function AgendaPage() {
  const navigate = useNavigate();
  const [consultas, setConsultas]     = useState([]);
  const [periodo, setPeriodo]         = useState('week');
  const [data, setData]               = useState(hoje());
  const [loading, setLoading]         = useState(true);
  const [erro, setErro]               = useState('');
  const [cancelModal, setCancelModal] = useState(null); // { id, recorrencia_id }

  async function carregar() {
    setLoading(true); setErro('');
    try {
      const d = new Date(data + 'T12:00:00');
      const p = { period: periodo, date: data };
      if (periodo === 'month') { p.year = d.getFullYear(); p.month = d.getMonth()+1; }
      const { data: res } = await listAppointments(p);
      setConsultas(res);
    } catch { setErro('Erro ao carregar agenda.'); }
    finally   { setLoading(false); }
  }

  useEffect(() => { carregar(); }, [periodo, data]);

  function handleCancelarClick(c) {
    if (c.recorrencia_id) {
      setCancelModal({ id: c.id, recorrencia_id: c.recorrencia_id });
    } else {
      executarCancelamento(c.id, 'one');
    }
  }

  async function executarCancelamento(id, scope) {
    setCancelModal(null);
    try {
      await cancelAppointment(id, scope);
      await carregar();
    } catch { setErro('Erro ao cancelar.'); }
  }

  async function handleConcluir(id) {
    try {
      await completeAppointment(id);
      await carregar();
    } catch { setErro('Erro ao atualizar.'); }
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Agenda</h2>
          <p className="text-gray-500 text-sm mt-1">{consultas.length} consulta(s) · Duração fixa: 60 min</p>
        </div>
        <Link to="/appointments/new" className="btn-primary">+ Nova consulta</Link>
      </div>

      <Alert type="error" message={erro} />

      {/* Modal de escopo do cancelamento */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20" onClick={() => setCancelModal(null)} />
          <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm p-5 max-w-sm w-full">
            <h3 className="text-sm font-medium text-gray-800 mb-1">Cancelar consulta</h3>
            <p className="text-xs text-gray-400 mb-4">Esta consulta faz parte de uma série recorrente.</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => executarCancelamento(cancelModal.id, 'one')}
                className="btn-secondary justify-center text-sm">
                Cancelar somente esta
              </button>
              <button onClick={() => executarCancelamento(cancelModal.id, 'all')}
                className="btn-secondary justify-center text-sm text-gray-500">
                Cancelar todas as futuras
              </button>
              <button onClick={() => setCancelModal(null)}
                className="btn-ghost justify-center text-xs text-gray-400 mt-1">
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="card p-4 mb-5 flex flex-wrap items-center gap-4">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {[['day','Dia'],['week','Semana'],['month','Mês']].map(([v,l]) => (
            <button key={v} onClick={() => setPeriodo(v)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${periodo===v ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              {l}
            </button>
          ))}
        </div>
        <input type="date" value={data} onChange={e => setData(e.target.value)} className="input w-auto" />
        <button onClick={() => setData(hoje())} className="btn-ghost text-sm">Hoje</button>
      </div>

      {loading ? <Spinner /> : consultas.length === 0 ? (
        <div className="card text-center py-14">
          
          <p className="text-gray-400 mb-4">Nenhuma consulta no período.</p>
          <Link to="/appointments/new" className="btn-primary">Agendar consulta</Link>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                {['Data e hora','Paciente','Etapa','Recorrência','Status',''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {consultas.map(c => (
                <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDateTimeBR(c.scheduled_at)}</td>
                  <td className="px-4 py-3">
                    <Link to={`/patients/${c.patient_id}`} className="font-medium text-gray-900 hover:text-brand-600">
                      {c.patient_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3"><TagFunil etapa={c.funil_etapa} /></td>
                  <td className="px-4 py-3"><TagRecorrencia tipo={c.recorrencia_tipo} /></td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 justify-end">
                      <button onClick={() => navigate(`/appointments/${c.id}/edit`)}
                        className="text-xs text-gray-400 hover:text-brand-600">Editar</button>
                      {c.status === 'scheduled' && (
                        <>
                          <button onClick={() => handleConcluir(c.id)}
                            className="text-xs text-green-600 hover:text-green-700 font-medium">Realizada</button>
                          <button onClick={() => handleCancelarClick(c)}
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
