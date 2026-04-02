import { useEffect, useState } from 'react';
import { getProntuario, saveProntuario, downloadContrato, downloadEvolucao } from '../services/prontuarioService';
import Modal from './Modal';
import Alert from './Alert';
import Spinner from './Spinner';

export default function ModalProntuario({ paciente, onClose }) {
  const [evolucao, setEvolucao]         = useState('');
  const [arquivo, setArquivo]           = useState(null);
  const [nomeContrato, setNomeContrato] = useState('');
  const [loading, setLoading]           = useState(true);
  const [salvando, setSalvando]         = useState(false);
  const [baixando, setBaixando]         = useState(false);
  const [msg, setMsg]                   = useState({ type: '', text: '' });

  useEffect(() => {
    async function carregar() {
      try {
        const { data } = await getProntuario(paciente.id);
        if (data?.evolucao)      setEvolucao(data.evolucao);
        if (data?.contrato_nome) setNomeContrato(data.contrato_nome);
      } catch { /* prontuário ainda não existe */ }
      finally { setLoading(false); }
    }
    carregar();
  }, [paciente.id]);

  async function handleSalvar() {
    setSalvando(true);
    setMsg({ type: '', text: '' });

    // FormData para enviar texto + arquivo juntos
    const formData = new FormData();
    formData.append('evolucao', evolucao);
    if (arquivo) formData.append('contrato', arquivo);

    try {
      await saveProntuario(paciente.id, formData);
      setMsg({ type: 'success', text: 'Prontuário salvo com sucesso!' });
      if (arquivo) {
        setNomeContrato(arquivo.name);
        setArquivo(null);
      }
    } catch (err) {
      const mensagem = err.response?.data?.message || 'Erro ao salvar prontuário.';
      setMsg({ type: 'error', text: mensagem });
    } finally {
      setSalvando(false);
    }
  }

  // Função auxiliar para trigger de download de blob
  function triggerDownload(blob, nomeArquivo) {
    const url  = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href  = url;
    link.setAttribute('download', nomeArquivo);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  // Download do prontuário em PDF (com dados do psicólogo + paciente + evolução)
  async function handleDownloadEvolucao() {
    setBaixando(true);
    try {
      const { data } = await downloadEvolucao(paciente.id);
      triggerDownload(data, `prontuario_${paciente.name.replace(/\s/g, '_')}.pdf`);
    } catch {
      setMsg({ type: 'error', text: 'Erro ao gerar PDF do prontuário.' });
    } finally {
      setBaixando(false);
    }
  }

  // Download do contrato terapêutico anexado
  async function handleDownloadContrato() {
    try {
      const { data } = await downloadContrato(paciente.id);
      triggerDownload(data, nomeContrato || 'contrato.pdf');
    } catch {
      setMsg({ type: 'error', text: 'Erro ao baixar contrato.' });
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={`Prontuário — ${paciente.name}`}>
      {loading ? (
        <Spinner text="Carregando prontuário..." />
      ) : (
        <div className="space-y-5">

          {/* Aviso de criptografia */}
          <div className="flex items-start gap-2 bg-brand-50 border border-brand-200 rounded-lg px-3 py-2.5 text-xs text-brand-700">
            <span className="flex-shrink-0 mt-0.5">🔒</span>
            <span>
              Os dados deste prontuário são <strong>criptografados</strong> no banco de dados
              e visíveis apenas para você autenticado.
            </span>
          </div>

          <Alert type={msg.type} message={msg.text} />

          {/* Evolução clínica */}
          <div>
            <label className="label">Evolução clínica</label>
            <textarea
              value={evolucao}
              onChange={e => setEvolucao(e.target.value)}
              rows={6}
              className="input resize-none"
              placeholder="Registre as observações, evolução e notas clínicas do paciente..."
            />
            <p className="text-xs text-gray-400 mt-1">
              Este campo é criptografado antes de ser salvo no banco de dados.
            </p>
          </div>

          {/* Contrato terapêutico */}
          <div>
            <label className="label">Contrato Terapêutico (PDF ou Word)</label>

            {/* Mostra contrato existente com botão de download */}
            {nomeContrato && !arquivo && (
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 mb-2">
                <span>📄</span>
                <p className="text-sm text-gray-700 flex-1 truncate">{nomeContrato}</p>
                <button
                  onClick={handleDownloadContrato}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                >
                  Baixar
                </button>
              </div>
            )}

            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={e => setArquivo(e.target.files[0] || null)}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                file:text-sm file:font-medium file:bg-brand-600 file:text-white
                hover:file:bg-brand-700 cursor-pointer"
            />
            {arquivo && (
              <p className="text-xs text-green-600 mt-1">✓ Arquivo selecionado: {arquivo.name}</p>
            )}
          </div>

          {/* Botões de ação */}
          <div className="flex flex-wrap gap-3 pt-1 border-t border-gray-100">
            {/* Salvar */}
            <button onClick={handleSalvar} disabled={salvando} className="btn-primary">
              {salvando ? 'Salvando...' : '💾 Salvar prontuário'}
            </button>

            {/* Download do prontuário completo em PDF */}
            <button
              onClick={handleDownloadEvolucao}
              disabled={baixando}
              className="btn-secondary"
            >
              {baixando ? 'Gerando PDF...' : '📥 Baixar prontuário (PDF)'}
            </button>

            <button onClick={onClose} className="btn-ghost">Fechar</button>
          </div>

          {/* Informação sobre o PDF gerado */}
          <p className="text-xs text-gray-400">
            O PDF do prontuário incluirá seus dados profissionais (nome e CRP),
            os dados cadastrais do paciente e a evolução clínica registrada.
          </p>
        </div>
      )}
    </Modal>
  );
}
