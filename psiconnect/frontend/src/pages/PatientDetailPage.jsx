import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPatient } from '../services/patientService';
import { listAppointments } from '../services/appointmentService';
import { formatDateBR, formatDateTimeBR, formatPhone, getInitials } from '../utils/formatUtils';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import ModalProntuario from '../components/ModalProntuario';

const COR_ETAPA = {
  'Interessado':        'bg-gray-500/15 text-gray-300 border-gray-500/30',
  'Triagem':            'bg-blue-500/15 text-blue-300 border-blue-500/30',
  'Agendamento':        'bg-psi-500/15 text-psi-300 border-psi-500/30',
  'Primeira Sessão':    'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  'Paciente Ativo':     'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'Aguardando Retorno': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'Alta/Encerrado':     'bg-teal-500/15 text-teal-300 border-teal-500/30',
  'Abandono':           'bg-red-500/15 text-red-300 border-red-500/30',
};

export default function PatientDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [paciente, setPaciente]   = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [erro, setErro]           = useState('');
  const [prontuarioAberto, setProntuarioAberto] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        const [{ data: p }, { data: c }] = await Promise.all([
          getPatient(id),
          listAppointments({ patientId: id }),
        ]);
        setPaciente(p);
        setConsultas(c);
      } catch { setErro('Erro ao carregar dados do paciente.'); }
      finally  { setLoading(false); }
    }
    carregar();
  }, [id]);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate('/patients')} className="btn-ghost text-sm mb-4">← Voltar</button>

      <Alert type="error" message={erro} />

      {paciente && (
        <>
          {/* Cabeçalho */}
          <div className="card mb-5 flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-psi-700/40 border border-psi-600/30 flex items-center justify-center text-2xl font-bold text-psi-300 flex-shrink-0">
              {getInitials(paciente.name)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h2 className="text-xl font-extrabold text-dark-100">{paciente.name}</h2>
                {/* Tag da etapa do funil */}
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${COR_ETAPA[paciente.funil_etapa] || ''}`}>
                  {paciente.funil_etapa}
                </span>
              </div>
              <p className="text-dark-400 text-sm">{paciente.email || '—'} · {formatPhone(paciente.phone)}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setProntuarioAberto(true)} className="btn-primary text-xs">
                📋 Prontuário
              </button>
              <Link to={`/patients/${id}/edit`} className="btn-secondary text-xs">Editar</Link>
              <Link to={`/history/${id}`} className="btn-ghost text-xs">Histórico</Link>
            </div>
          </div>

          {/* Dados pessoais */}
          <div className="card mb-5">
            <h3 className="font-bold text-dark-200 mb-4 text-sm uppercase tracking-wide">Dados pessoais</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Nascimento', value: formatDateBR(paciente.birth_date) },
                { label: 'CPF',        value: paciente.cpf     || '—' },
                { label: 'Endereço',   value: paciente.address || '—', col: 2 },
                { label: 'Observações',value: paciente.notes   || '—', col: 2 },
              ].map(item => (
                <div key={item.label} className={item.col === 2 ? 'col-span-2' : ''}>
                  <p className="text-xs text-dark-400 font-semibold uppercase tracking-wide mb-1">{item.label}</p>
                  <p className="text-dark-200">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Consultas */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-dark-200 text-sm uppercase tracking-wide">
                Consultas ({consultas.length})
              </h3>
              <Link to={`/appointments/new?patientId=${id}`} className="btn-primary text-xs">+ Agendar</Link>
            </div>

            {consultas.length === 0 ? (
              <p className="text-sm text-dark-400 text-center py-6">Nenhuma consulta registrada.</p>
            ) : (
              <div className="space-y-2">
                {consultas.map(c => (
                  <div key={c.id}
                    className="flex items-center justify-between px-4 py-3 rounded-lg bg-dark-800 border border-dark-700">
                    <p className="text-sm text-dark-200">{formatDateTimeBR(c.scheduled_at)}</p>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={c.status} />
                      <Link to={`/appointments/${c.id}/edit`}
                        className="text-xs text-dark-400 hover:text-psi-400">Editar</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal de prontuário */}
      {prontuarioAberto && paciente && (
        <ModalProntuario
          paciente={paciente}
          onClose={() => setProntuarioAberto(false)}
        />
      )}
    </div>
  );
}
