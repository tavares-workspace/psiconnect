import { useEffect, useState } from 'react';
import { listReminders, createReminder, updateReminder, deleteReminder } from '../services/reminderService';
import { formatDateTimeBR } from '../utils/formatUtils';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

const VAZIO = { title: '', description: '', remind_at: '' };

export default function RemindersPage() {
  const [lembretes, setLembretes] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [erro, setErro]           = useState('');
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState(VAZIO);
  const [salvando, setSalvando]   = useState(false);

  async function carregar() {
    try {
      const { data } = await listReminders();
      setLembretes(data);
    } catch {
      setErro('Erro ao carregar lembretes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSalvar() {
    if (!form.title || !form.remind_at) {
      setErro('Título e data são obrigatórios.');
      return;
    }
    setSalvando(true);
    try {
      await createReminder(form);
      setModal(false);
      setForm(VAZIO);
      await carregar();
    } catch {
      setErro('Erro ao salvar lembrete.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleToggle(l) {
    try {
      await updateReminder(l.id, { ...l, done: !l.done });
      setLembretes(lembretes.map((x) => x.id === l.id ? { ...x, done: !x.done } : x));
    } catch {
      setErro('Erro ao atualizar.');
    }
  }

  async function handleRemover(id) {
    if (!confirm('Remover este lembrete?')) return;
    try {
      await deleteReminder(id);
      setLembretes(lembretes.filter((l) => l.id !== id));
    } catch {
      setErro('Erro ao remover.');
    }
  }

  const pendentes  = lembretes.filter((l) => !l.done);
  const concluidos = lembretes.filter((l) => l.done);

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-dark-100">Lembretes</h2>
          <p className="text-dark-400 text-sm mt-1">{pendentes.length} pendente(s)</p>
        </div>
        <button onClick={() => { setForm(VAZIO); setModal(true); }} className="btn-primary">
          + Novo lembrete
        </button>
      </div>

      <Alert type="error" message={erro} />

      {loading ? <Spinner /> : (
        lembretes.length === 0 ? (
          <div className="card text-center py-14">
            <p className="text-4xl mb-3">🔔</p>
            <p className="text-dark-400">Nenhum lembrete cadastrado.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Pendentes */}
            {pendentes.length > 0 && (
              <div className="card space-y-3">
                <p className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1">Pendentes</p>
                {pendentes.map((l) => (
                  <div key={l.id} className="flex items-start gap-3 group">
                    <input type="checkbox" checked={l.done} onChange={() => handleToggle(l)}
                      className="mt-1 accent-psi-500 w-4 h-4 cursor-pointer flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-dark-200">{l.title}</p>
                      {l.description && <p className="text-xs text-dark-400 mt-0.5">{l.description}</p>}
                      <p className="text-xs text-dark-500 mt-1">📅 {formatDateTimeBR(l.remind_at)}</p>
                    </div>
                    <button onClick={() => handleRemover(l.id)}
                      className="text-dark-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs mt-0.5">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Concluídos */}
            {concluidos.length > 0 && (
              <div className="card space-y-3 opacity-50">
                <p className="text-xs font-bold text-dark-400 uppercase tracking-wide mb-1">Concluídos</p>
                {concluidos.map((l) => (
                  <div key={l.id} className="flex items-center gap-3 group">
                    <input type="checkbox" checked={l.done} onChange={() => handleToggle(l)}
                      className="accent-psi-500 w-4 h-4 cursor-pointer flex-shrink-0" />
                    <p className="text-sm text-dark-400 line-through flex-1">{l.title}</p>
                    <button onClick={() => handleRemover(l.id)}
                      className="text-dark-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Novo lembrete">
        <div className="space-y-4">
          <div>
            <label className="label">Título *</label>
            <input type="text" name="title" value={form.title} onChange={handleChange}
              className="input" placeholder="Ex: Ligar para paciente" autoFocus />
          </div>
          <div>
            <label className="label">Descrição</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              rows={2} className="input resize-none" placeholder="Detalhes opcionais..." />
          </div>
          <div>
            <label className="label">Data e hora *</label>
            <input type="datetime-local" name="remind_at" value={form.remind_at}
              onChange={handleChange} className="input" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSalvar} disabled={salvando} className="btn-primary">
              {salvando ? 'Salvando...' : 'Criar lembrete'}
            </button>
            <button onClick={() => setModal(false)} className="btn-secondary">Cancelar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
