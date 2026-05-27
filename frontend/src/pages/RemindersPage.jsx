import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listReminders, createReminder, updateReminder, deleteReminder } from '../services/reminderService';
import { getTarefas, concluirTarefa, removerTarefa } from '../services/tarefaService';
import { formatDateTimeBR } from '../utils/formatUtils';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

const VAZIO = { title: '', description: '', remind_at: '' };

const TIPO_LABEL = { prontuario: 'Prontuário', retorno: 'Retorno', aniversario: 'Aniversário' };

export default function RemindersPage() {
  const navigate = useNavigate();
  const [lembretes, setLembretes] = useState([]);
  const [tarefas, setTarefas]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [erro, setErro]           = useState('');
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState(VAZIO);
  const [salvando, setSalvando]   = useState(false);

  async function carregar() {
    try {
      const [{ data: l }, { data: t }] = await Promise.all([
        listReminders(),
        getTarefas(),
      ]);
      setLembretes(l);
      setTarefas(t);
    } catch {
      setErro('Erro ao carregar.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function handleSalvar() {
    if (!form.title || !form.remind_at) { setErro('Título e data são obrigatórios.'); return; }
    setSalvando(true);
    try {
      await createReminder(form);
      setModal(false);
      setForm(VAZIO);
      await carregar();
    } catch { setErro('Erro ao salvar.'); }
    finally   { setSalvando(false); }
  }

  async function handleToggle(l) {
    try {
      await updateReminder(l.id, { ...l, done: !l.done });
      setLembretes(lembretes.map(x => x.id === l.id ? { ...x, done: !x.done } : x));
    } catch { setErro('Erro ao atualizar.'); }
  }

  async function handleRemover(id) {
    if (!confirm('Remover este lembrete?')) return;
    try {
      await deleteReminder(id);
      setLembretes(lembretes.filter(l => l.id !== id));
    } catch { setErro('Erro ao remover.'); }
  }

  async function handleConcluirTarefa(id) {
    try {
      await concluirTarefa(id);
      setTarefas(tarefas.filter(t => t.id !== id));
    } catch { setErro('Erro ao concluir tarefa.'); }
  }

  async function handleRemoverTarefa(id) {
    try {
      await removerTarefa(id);
      setTarefas(tarefas.filter(t => t.id !== id));
    } catch { setErro('Erro ao remover tarefa.'); }
  }

  const pendentes  = lembretes.filter(l => !l.done);
  const concluidos = lembretes.filter(l => l.done);

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Lembretes</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {tarefas.length + pendentes.length} pendente(s)
          </p>
        </div>
        <button onClick={() => { setForm(VAZIO); setModal(true); }} className="btn-primary">
          + Novo lembrete
        </button>
      </div>

      <Alert type="error" message={erro} />

      {loading ? <Spinner /> : (
        <>
          {/* Tarefas automáticas */}
          {tarefas.length > 0 && (
            <div className="card">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Tarefas do sistema
              </p>
              <div className="space-y-2">
                {tarefas.map(t => (
                  <div key={t.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-base flex-shrink-0">{TIPO_LABEL[t.tipo] || 'Tarefa'}</span>
                      <p className="text-sm text-gray-700 truncate">{t.titulo}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {t.tipo === 'prontuario' && t.patient_id && (
                        <button
                          onClick={() => navigate(`/patients/${t.patient_id}`)}
                          className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                          Ver paciente →
                        </button>
                      )}
                      <button onClick={() => handleConcluirTarefa(t.id)}
                        className="text-xs text-green-600 hover:text-green-700 font-medium">
                        ✓
                      </button>
                      <button onClick={() => handleRemoverTarefa(t.id)}
                        className="text-xs text-gray-300 hover:text-red-400">
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lembretes manuais pendentes */}
          {pendentes.length > 0 && (
            <div className="card">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Lembretes pendentes
              </p>
              <div className="space-y-3">
                {pendentes.map(l => (
                  <div key={l.id} className="flex items-start gap-3 group">
                    <input type="checkbox" checked={l.done} onChange={() => handleToggle(l)}
                      className="mt-1 w-4 h-4 accent-brand-600 cursor-pointer flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{l.title}</p>
                      {l.description && <p className="text-xs text-gray-400 mt-0.5">{l.description}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">{formatDateTimeBR(l.remind_at)}</p>
                    </div>
                    <button onClick={() => handleRemover(l.id)}
                      className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs mt-0.5">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lembretes concluídos */}
          {concluidos.length > 0 && (
            <div className="card opacity-50">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Concluídos</p>
              <div className="space-y-2">
                {concluidos.map(l => (
                  <div key={l.id} className="flex items-center gap-3 group">
                    <input type="checkbox" checked={l.done} onChange={() => handleToggle(l)}
                      className="w-4 h-4 accent-brand-600 cursor-pointer flex-shrink-0" />
                    <p className="text-sm text-gray-400 line-through flex-1">{l.title}</p>
                    <button onClick={() => handleRemover(l.id)}
                      className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tarefas.length === 0 && lembretes.length === 0 && (
            <div className="card text-center py-12">
              
              <p className="text-gray-400 text-sm">Nenhum lembrete ou tarefa pendente.</p>
            </div>
          )}
        </>
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
              {salvando ? 'Salvando...' : 'Criar'}
            </button>
            <button onClick={() => setModal(false)} className="btn-secondary">Cancelar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
