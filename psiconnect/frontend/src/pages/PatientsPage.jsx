import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listPatients, deletePatient } from '../services/patientService';
import { formatPhone, getInitials } from '../utils/formatUtils';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import ModalProntuario from '../components/ModalProntuario';

const COR_ETAPA = {
  'Interessado':        'bg-gray-100 text-gray-600 border-gray-200',
  'Triagem':            'bg-blue-50 text-blue-700 border-blue-200',
  'Agendamento':        'bg-brand-50 text-brand-700 border-brand-200',
  'Primeira Sessão':    'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Paciente Ativo':     'bg-green-50 text-green-700 border-green-200',
  'Aguardando Retorno': 'bg-amber-50 text-amber-700 border-amber-200',
  'Alta/Encerrado':     'bg-teal-50 text-teal-700 border-teal-200',
  'Abandono':           'bg-red-50 text-red-700 border-red-200',
};

export default function PatientsPage() {
  const navigate = useNavigate();
  const [pacientes, setPacientes]   = useState([]);
  const [busca, setBusca]           = useState('');
  const [loading, setLoading]       = useState(true);
  const [erro, setErro]             = useState('');
  const [prontuarioAberto, setProntuarioAberto] = useState(null);

  async function carregar(q = '') {
    setLoading(true);
    try { const { data } = await listPatients(q); setPacientes(data); }
    catch { setErro('Erro ao carregar pacientes.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { carregar(); }, []);

  async function handleRemover(id, nome) {
    if (!confirm(`Remover o paciente "${nome}"?`)) return;
    try { await deletePatient(id); setPacientes(pacientes.filter(p => p.id !== id)); }
    catch { setErro('Erro ao remover paciente.'); }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pacientes</h2>
          <p className="text-gray-500 text-sm mt-1">{pacientes.length} paciente(s) ativo(s)</p>
        </div>
        <Link to="/patients/new" className="btn-primary">+ Novo paciente</Link>
      </div>

      <Alert type="error" message={erro} />

      <form onSubmit={e => { e.preventDefault(); carregar(busca); }} className="flex gap-2 mb-5">
        <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
          className="input max-w-xs" placeholder="Buscar por nome, e-mail ou telefone..." />
        <button type="submit" className="btn-secondary">Buscar</button>
        {busca && <button type="button" className="btn-ghost" onClick={() => { setBusca(''); carregar(''); }}>Limpar</button>}
      </form>

      {loading ? <Spinner /> : pacientes.length === 0 ? (
        <div className="card text-center py-14">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-gray-400 mb-4">Nenhum paciente encontrado.</p>
          <Link to="/patients/new" className="btn-primary">Cadastrar primeiro paciente</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pacientes.map(p => (
            <div key={p.id} className="card-hover group">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-sm font-bold text-brand-700 flex-shrink-0">
                  {getInitials(p.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatPhone(p.phone)}</p>
                  {p.email && <p className="text-xs text-gray-400 truncate">{p.email}</p>}
                </div>
              </div>

              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${COR_ETAPA[p.funil_etapa] || ''}`}>
                {p.funil_etapa}
              </span>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => navigate(`/patients/${p.id}`)} className="btn-primary text-xs py-1 px-3">Ver</button>
                <button onClick={() => setProntuarioAberto(p)} className="btn-secondary text-xs py-1 px-3">Prontuário</button>
                <button onClick={() => navigate(`/patients/${p.id}/edit`)} className="btn-ghost text-xs py-1 px-2">Editar</button>
                <button onClick={() => handleRemover(p.id, p.name)} className="btn-ghost text-xs py-1 px-2 text-red-500 hover:text-red-700">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {prontuarioAberto && <ModalProntuario paciente={prontuarioAberto} onClose={() => setProntuarioAberto(null)} />}
    </div>
  );
}
