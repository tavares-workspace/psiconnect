import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPatient } from '../services/patientService';
import { listAppointments } from '../services/appointmentService';
import { formatDateBR, formatDateTimeBR, formatPhone } from '../utils/formatUtils';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import ModalProntuario from '../components/ModalProntuario';

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
      <button onClick={() => navigate('/patients')} className="text-sm text-gray-400 hover:text-gray-600 mb-4">
        ← Voltar
      </button>

      <Alert type="error" message={erro} />

      {paciente && (
        <>
          {/* Cabeçalho */}
          <div className="card mb-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h2 className="text-xl font-bold text-gray-900">{paciente.name}</h2>
                  <span className="text-xs text-gray-400">{paciente.funil_etapa}</span>
                </div>
                <p className="text-sm text-gray-500">
                  {paciente.email || '—'} · {formatPhone(paciente.phone) || '—'}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap flex-shrink-0">
                <button onClick={() => setProntuarioAberto(true)} className="btn-primary text-xs">
                  Prontuário
                </button>
                <Link to={`/patients/${id}/edit`} className="btn-secondary text-xs">Editar</Link>
              </div>
            </div>
          </div>

          {/* Dados pessoais */}
          <div className="card mb-5">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Dados pessoais</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Nascimento</p>
                <p className="text-gray-700">{formatDateBR(paciente.birth_date) || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">CPF</p>
                <p className="text-gray-700">{paciente.cpf || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-400 mb-0.5">Endereço</p>
                <p className="text-gray-700">{paciente.address || '—'}</p>
              </div>
              {paciente.notes && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-0.5">Observações</p>
                  <p className="text-gray-700">{paciente.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Consultas */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">
                Consultas ({consultas.length})
              </h3>
              <Link to={`/appointments/new?patientId=${id}`} className="btn-primary text-xs">
                + Agendar
              </Link>
            </div>

            {consultas.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Nenhuma consulta registrada.</p>
            ) : (
              <div className="space-y-2">
                {consultas.map(c => (
                  <div key={c.id}
                    onClick={() => navigate(`/appointments/${c.id}/edit`)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                    <p className="text-sm text-gray-700">{formatDateTimeBR(c.scheduled_at)}</p>
                    <StatusBadge status={c.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {prontuarioAberto && paciente && (
        <ModalProntuario
          paciente={paciente}
          onClose={() => setProntuarioAberto(false)}
        />
      )}
    </div>
  );
}
