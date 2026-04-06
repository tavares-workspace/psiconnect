import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getAppointment, createAppointment, updateAppointment } from '../services/appointmentService';
import { listPatients } from '../services/patientService';
import { toInputDatetime } from '../utils/formatUtils';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

// Duração fixa de 60 minutos — não há campo para alterar isso
const VAZIO = { patient_id: '', scheduled_at: '', price: '', status: 'scheduled' };

export default function AppointmentFormPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [params]     = useSearchParams();
  const editando     = !!id;

  const [form, setForm]           = useState({ ...VAZIO, patient_id: params.get('patientId') || '' });
  const [pacientes, setPacientes] = useState([]);
  const [erro, setErro]           = useState('');
  const [loading, setLoading]     = useState(false);
  const [buscando, setBuscando]   = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const { data: ps } = await listPatients();
        setPacientes(ps);
        if (editando) {
          const { data: c } = await getAppointment(id);
          setForm({
            patient_id:   c.patient_id,
            scheduled_at: toInputDatetime(c.scheduled_at),
            price:        c.price || '',
            status:       c.status,
          });
        }
      } catch { setErro('Erro ao carregar dados.'); }
      finally  { setBuscando(false); }
    }
    carregar();
  }, [id, editando]);

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(''); setLoading(true);
    try {
      if (editando) {
        await updateAppointment(id, form);
      } else {
        await createAppointment(form);
      }
      navigate('/agenda');
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao salvar consulta.');
    } finally { setLoading(false); }
  }

  if (buscando) return <Spinner />;

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <button onClick={() => navigate('/agenda')} className="btn-ghost text-sm mb-3">← Voltar</button>
        <h2 className="text-2xl font-extrabold text-dark-100">
          {editando ? 'Editar consulta' : 'Nova consulta'}
        </h2>
      </div>

      <div className="card">
        {/* Aviso de duração fixa */}
        <div className="flex items-center gap-2 bg-psi-500/10 border border-psi-500/30 rounded-lg px-3 py-2.5 mb-5 text-xs text-psi-300">
          <span>⏱</span>
          <span>Todas as consultas têm duração fixa de <strong>60 minutos</strong>.</span>
        </div>

        <Alert type="error" message={erro} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Paciente *</label>
            <select name="patient_id" value={form.patient_id} onChange={handleChange}
              required className="input bg-dark-800">
              <option value="">Selecione um paciente</option>
              {pacientes.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Data e hora de início *</label>
            <input type="datetime-local" name="scheduled_at" value={form.scheduled_at}
              onChange={handleChange} required className="input" />
            <p className="text-xs text-dark-500 mt-1">
              A consulta termina automaticamente 60 minutos após o horário de início.
            </p>
          </div>

          <div>
            <label className="label">Valor (R$)</label>
            <input type="number" name="price" value={form.price}
              onChange={handleChange} min={0} step="0.01" className="input" placeholder="0,00" />
          </div>

          {editando && (
            <div>
              <label className="label">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input bg-dark-800">
                <option value="scheduled">Agendada</option>
                <option value="completed">Realizada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Salvando...' : editando ? 'Salvar' : 'Agendar consulta'}
            </button>
            <button type="button" onClick={() => navigate('/agenda')} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
