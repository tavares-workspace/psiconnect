import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatient } from '../services/patientService';
import { getHistoryByPatient, createNote, deleteNote } from '../services/noteService';
import { formatDateTimeBR, getInitials } from '../utils/formatUtils';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import Modal from '../components/Modal';

export default function HistoryPage() {
  const { patientId } = useParams();
  const navigate      = useNavigate();

  const [paciente, setPaciente]   = useState(null);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [erro, setErro]           = useState('');

  // Modal de nova anotação
  const [modalAberto, setModalAberto]   = useState(false);
  const [consultaSel, setConsultaSel]   = useState(null);
  const [textoNota, setTextoNota]       = useState('');
  const [salvando, setSalvando]         = useState(false);

  async function carregar() {
    try {
      const [{ data: p }, { data: h }] = await Promise.all([
        getPatient(patientId),
        getHistoryByPatient(patientId),
      ]);
      setPaciente(p);
      setHistorico(h);
    } catch {
      setErro('Erro ao carregar histórico.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, [patientId]);

  function abrirModal(appointmentId) {
    setConsultaSel(appointmentId);
    setTextoNota('');
    setModalAberto(true);
  }

  async function handleSalvarNota() {
    if (!textoNota.trim()) return;
    setSalvando(true);
    try {
      await createNote(consultaSel, textoNota);
      setModalAberto(false);
      await carregar();
    } catch {
      setErro('Erro ao salvar anotação.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleRemoverNota(noteId) {
    if (!confirm('Remover esta anotação?')) return;
    try {
      await deleteNote(noteId);
      await carregar();
    } catch {
      setErro('Erro ao remover anotação.');
    }
  }

  if (loading) return <Spinner />;

  // Agrupa as notas por consulta (appointment_id)
  const agrupado = historico.reduce((acc, nota) => {
    const chave = nota.appointment_id;
    if (!acc[chave]) acc[chave] = { scheduled_at: nota.scheduled_at, notas: [] };
    acc[chave].notas.push(nota);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate(`/patients/${patientId}`)} className="btn-ghost text-sm mb-4">
        ← Voltar ao paciente
      </button>

      {/* Cabeçalho */}
      {paciente && (
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-psi-700/40 border border-psi-600/30 flex items-center justify-center text-lg font-bold text-psi-300">
            {getInitials(paciente.name)}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-dark-100">Histórico clínico</h2>
            <p className="text-dark-400 text-sm">{paciente.name}</p>
          </div>
        </div>
      )}

      <Alert type="error" message={erro} />

      {Object.keys(agrupado).length === 0 ? (
        <div className="card text-center py-14">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-dark-400">Nenhuma anotação registrada para este paciente.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(agrupado).map(([apptId, { scheduled_at, notas }]) => (
            <div key={apptId} className="card">
              {/* Cabeçalho da sessão */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-psi-400 text-sm">📅</span>
                  <span className="text-sm font-bold text-dark-200">
                    {formatDateTimeBR(scheduled_at)}
                  </span>
                </div>
                <button
                  onClick={() => abrirModal(apptId)}
                  className="btn-ghost text-xs text-psi-400">
                  + Anotação
                </button>
              </div>

              {/* Lista de notas da sessão */}
              <div className="space-y-2">
                {notas.map((nota) => (
                  <div key={nota.id}
                    className="group relative bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-sm text-dark-200 leading-relaxed">
                    <p className="whitespace-pre-wrap pr-6">{nota.content}</p>
                    <button
                      onClick={() => handleRemoverNota(nota.id)}
                      className="absolute top-2 right-3 text-dark-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para adicionar nota */}
      <Modal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        title="Nova anotação clínica"
      >
        <div className="space-y-4">
          <textarea
            value={textoNota}
            onChange={(e) => setTextoNota(e.target.value)}
            rows={5}
            className="input resize-none"
            placeholder="Registre as observações da sessão..."
            autoFocus
          />
          <div className="flex gap-3">
            <button
              onClick={handleSalvarNota}
              disabled={salvando || !textoNota.trim()}
              className="btn-primary">
              {salvando ? 'Salvando...' : 'Salvar anotação'}
            </button>
            <button onClick={() => setModalAberto(false)} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
