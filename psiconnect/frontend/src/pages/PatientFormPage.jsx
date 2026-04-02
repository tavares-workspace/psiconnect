import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPatient, createPatient, updatePatient } from '../services/patientService';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

const VAZIO = { name: '', email: '', phone: '', birth_date: '', cpf: '', address: '', notes: '' };

export default function PatientFormPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const editando  = !!id;

  const [form, setForm]         = useState(VAZIO);
  const [erro, setErro]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [buscando, setBuscando] = useState(editando);

  // Se for edição, busca os dados atuais do paciente
  useEffect(() => {
    if (!editando) return;
    async function buscar() {
      try {
        const { data } = await getPatient(id);
        setForm({
          name:       data.name       || '',
          email:      data.email      || '',
          phone:      data.phone      || '',
          birth_date: data.birth_date ? data.birth_date.slice(0, 10) : '',
          cpf:        data.cpf        || '',
          address:    data.address    || '',
          notes:      data.notes      || '',
        });
      } catch {
        setErro('Erro ao carregar dados do paciente.');
      } finally {
        setBuscando(false);
      }
    }
    buscar();
  }, [id, editando]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      if (editando) {
        await updatePatient(id, form);
      } else {
        await createPatient(form);
      }
      navigate('/patients');
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  }

  if (buscando) return <Spinner />;

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <button onClick={() => navigate('/patients')} className="btn-ghost text-sm mb-3">
          ← Voltar
        </button>
        <h2 className="text-2xl font-extrabold text-dark-100">
          {editando ? 'Editar paciente' : 'Novo paciente'}
        </h2>
      </div>

      <div className="card">
        <Alert type="error" message={erro} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nome completo *</label>
            <input type="text" name="name" value={form.name} onChange={handleChange}
              required className="input" placeholder="Nome do paciente" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">E-mail</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                className="input" placeholder="email@exemplo.com" />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange}
                className="input" placeholder="(11) 99999-9999" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nascimento</label>
              <input type="date" name="birth_date" value={form.birth_date} onChange={handleChange}
                className="input" />
            </div>
            <div>
              <label className="label">CPF</label>
              <input type="text" name="cpf" value={form.cpf} onChange={handleChange}
                className="input" placeholder="000.000.000-00" />
            </div>
          </div>

          <div>
            <label className="label">Endereço</label>
            <input type="text" name="address" value={form.address} onChange={handleChange}
              className="input" placeholder="Rua, número, bairro, cidade" />
          </div>

          <div>
            <label className="label">Observações</label>
            <textarea name="notes" value={form.notes} onChange={handleChange}
              rows={3} className="input resize-none"
              placeholder="Informações gerais sobre o paciente..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Salvando...' : editando ? 'Salvar alterações' : 'Cadastrar'}
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
