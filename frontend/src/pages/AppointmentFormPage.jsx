import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getAppointment, createAppointment, updateAppointment } from '../services/appointmentService';
import { listPatients } from '../services/patientService';
import { toInputDatetime } from '../utils/formatUtils';

import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

const VAZIO = { patient_id: '', scheduled_at: '', recorrencia: '', status: 'scheduled' };

export default function AppointmentFormPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editando = !!id;

  const [form, setForm]         = useState({ ...VAZIO, patient_id: params.get('patientId') || '' });
  const [pacientes, setPacientes] = useState([]);
  const [erro, setErro]         = useState('');
  const [sucesso, setSucesso]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [buscando, setBuscando] = useState(true);
  const [escopoModal, setEscopoModal]   = useState(false);
  const [consultaAtual, setConsultaAtual] = useState(null);
  const [dadosPendentes, setDadosPendentes] = useState(null);

  useEffect(() => {
    async function carregar() {
      try {
        const { data: ps } = await listPatients();
        setPacientes(ps);
        if (editando) {
          const { data: c } = await getAppointment(id);
          setConsultaAtual(c);
          setForm({
            patient_id:   c.patient_id,
            scheduled_at: toInputDatetime(c.scheduled_at),
            recorrencia:  c.recorrencia_tipo || '',
            status:       c.status,
          });
        }
      } catch { setErro('Erro ao carregar dados.'); }
      finally  { setBuscando(false); }
    }
    carregar();
  }, [id, editando]);

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function salvarComEscopo(scope) {
    setEscopoModal(false);
    setLoading(true);
    try {
      await updateAppointment(id, dadosPendentes, scope);
      navigate('/agenda');
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao salvar.');
    } finally { setLoading(false); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(''); setSucesso('');

    if (!editando && form.scheduled_at) {
      const agora = new Date();
      const escolhida = new Date(form.scheduled_at);
      if (escolhida <= agora) {
        setErro('A data da consulta deve ser futura.');
        return;
      }
    }

    if (editando) {
      if (consultaAtual?.recorrencia_id) {
        setDadosPendentes(form);
        setEscopoModal(true);
        return;
      }
      setLoading(true);
      try {
        await updateAppointment(id, form, 'one');
        navigate('/agenda');
      } catch (err) {
        setErro(err.response?.data?.message || 'Erro ao salvar.');
      } finally { setLoading(false); }
      return;
    }

    setLoading(true);
    try {
      const res = await createAppointment(form);
      if (form.recorrencia && res.data.recorrentes > 0) {
        navigate('/agenda');
      } else {
        navigate('/agenda');
      }
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao agendar.');
    } finally { setLoading(false); }
  }

  if (buscando) return <Spinner />;

  return (
    <div className="max-w-md">
      <button onClick={() => navigate('/agenda')} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
        ← Voltar
      </button>

      <h2 className="text-xl font-bold text-gray-900 mb-5">
        {editando ? 'Editar consulta' : 'Nova consulta'}
      </h2>

      {escopoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20" onClick={() => setEscopoModal(false)} />
          <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm p-5 max-w-sm w-full">
            <h3 className="text-sm font-medium text-gray-800 mb-1">Editar consulta</h3>
            <p className="text-xs text-gray-400 mb-4">Esta consulta faz parte de uma série recorrente.</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => salvarComEscopo('one')}
                className="btn-secondary justify-center text-sm">
                Salvar somente esta
              </button>
              <button onClick={() => salvarComEscopo('all')}
                className="btn-secondary justify-center text-sm text-gray-500">
                Salvar todas da série
              </button>
              <button onClick={() => setEscopoModal(false)}
                className="btn-ghost justify-center text-xs text-gray-400 mt-1">
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <p className="text-xs text-gray-400 mb-4">Duração fixa de 60 min</p>

        <Alert type="error"   message={erro} />
        <Alert type="success" message={sucesso} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Paciente *</label>
            <select name="patient_id" value={form.patient_id} onChange={handleChange}
              required className="input bg-white">
              <option value="">Selecione</option>
              {pacientes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Data e hora *</label>
            <input type="datetime-local" name="scheduled_at" value={form.scheduled_at}
              onChange={handleChange} required className="input"
              min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)} />
          </div>

          {!editando && (
            <div>
              <label className="label">Recorrência <span className="text-gray-400 font-normal">(opcional)</span></label>
              <select name="recorrencia" value={form.recorrencia} onChange={handleChange}
                className="input bg-white">
                <option value="">Sessão única</option>
                <option value="semanal">Semanal — mesma data, toda semana</option>
                <option value="quinzenal">Quinzenal — a cada 15 dias</option>
                <option value="mensal">Mensal — a cada 30 dias</option>
              </select>
            </div>
          )}

          {editando && (
            <div>
              <label className="label">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input bg-white">
                <option value="scheduled">Agendada</option>
                <option value="completed">Realizada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Salvando...' : editando ? 'Salvar' : 'Agendar'}
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
