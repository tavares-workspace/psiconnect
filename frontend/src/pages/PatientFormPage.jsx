import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPatient, createPatient, updatePatient } from '../services/patientService';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

const VAZIO = { name:'', email:'', phone:'', birth_date:'', cpf:'', address:'', notes:'' };

function maskPhone(val) {
  const n = val.replace(/[^0-9]/g, '').slice(0, 11);
  if (n.length <= 2) return '(' + n;
  if (n.length <= 7) return '(' + n.slice(0,2) + ') ' + n.slice(2);
  return '(' + n.slice(0,2) + ') ' + n.slice(2,7) + '-' + n.slice(7);
}
function maskCPF(val) {
  const n = val.replace(/\D/g, '').slice(0, 11);
  if (n.length <= 3) return n;
  if (n.length <= 6) return n.slice(0,3) + '.' + n.slice(3);
  if (n.length <= 9) return n.slice(0,3) + '.' + n.slice(3,6) + '.' + n.slice(6);
  return n.slice(0,3) + '.' + n.slice(3,6) + '.' + n.slice(6,9) + '-' + n.slice(9);
}

export default function PatientFormPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const editando = !!id;

  const [form, setForm]     = useState(VAZIO);
  const [erro, setErro]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    if (!editando) return;
    setBuscando(true);
    getPatient(id)
      .then(({ data: p }) => setForm({
        name:       p.name       || '',
        email:      p.email      || '',
        phone:      p.phone      || '',
        birth_date: p.birth_date ? p.birth_date.slice(0,10) : '',
        cpf:        p.cpf        || '',
        address:    p.address    || '',
        notes:      p.notes      || '',
      }))
      .catch(() => setErro('Erro ao carregar paciente.'))
      .finally(() => setBuscando(false));
  }, [id, editando]);

  function set(campo, val) { setForm(prev => ({ ...prev, [campo]: val })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    // Validação de data futura
    if (form.birth_date && new Date(form.birth_date) > new Date()) {
      setErro('Data de nascimento não pode ser futura.');
      return;
    }

    setLoading(true);
    try {
      if (editando) await updatePatient(id, form);
      else          await createPatient(form);
      navigate('/patients');
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao salvar.');
    } finally { setLoading(false); }
  }

  if (buscando) return <Spinner />;

  return (
    <div className="max-w-lg">
      <button onClick={() => navigate('/patients')} className="text-sm text-gray-400 hover:text-gray-600 mb-4">
        ← Voltar
      </button>

      <h2 className="text-xl font-bold text-gray-900 mb-5">
        {editando ? 'Editar paciente' : 'Novo paciente'}
      </h2>

      <Alert type="error" message={erro} />

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nome completo *</label>
            <input type="text" value={form.name}
              onChange={e => set('name', e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''))}
              required className="input" placeholder="Nome do paciente" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">E-mail</label>
              <input type="email" value={form.email}
                onChange={e => set('email', e.target.value)}
                className="input" placeholder="email@exemplo.com" />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input type="text" value={form.phone}
                onChange={e => set('phone', maskPhone(e.target.value))}
                className="input" placeholder="(11) 99999-9999" maxLength={20} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Data de nascimento</label>
              <input type="date" value={form.birth_date}
                max={new Date().toISOString().slice(0,10)}
                onChange={e => set('birth_date', e.target.value)}
                className="input" />
              <p className="text-xs text-gray-400 mt-1">Não pode ser futura.</p>
            </div>
            <div>
              <label className="label">CPF</label>
              <input type="text" value={form.cpf}
                onChange={e => set('cpf', maskCPF(e.target.value))}
                className="input" placeholder="000.000.000-00" maxLength={14} />
            </div>
          </div>

          <div>
            <label className="label">Endereço</label>
            <input type="text" value={form.address}
              onChange={e => set('address', e.target.value.replace(/[^a-zA-ZÀ-ÿ0-9\s,.\-°/]/g, '').slice(0, 255))}
              className="input" placeholder="Rua, número, bairro..." maxLength={255} />
          </div>

          <div>
            <label className="label">Observações</label>
            <textarea value={form.notes}
              onChange={e => set('notes', e.target.value.slice(0, 2000))}
              rows={3} className="input resize-none" placeholder="Informações adicionais..."
              maxLength={2000} />
            <p className="text-xs text-gray-400 mt-1">{form.notes.length}/2000</p>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Salvando...' : editando ? 'Salvar' : 'Cadastrar'}
            </button>
            <button type="button" onClick={() => navigate('/patients')} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
