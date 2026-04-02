import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFunil, moverEtapa } from '../services/funilService';
import { formatPhone } from '../utils/formatUtils';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import ModalProntuario from '../components/ModalProntuario';

const COR_ETAPA = {
  'Interessado':        { borda: 'border-t-gray-400',   header: 'bg-gray-50',   dot: 'bg-gray-400',   texto: 'text-gray-600'   },
  'Triagem':            { borda: 'border-t-blue-400',   header: 'bg-blue-50',   dot: 'bg-blue-400',   texto: 'text-blue-700'   },
  'Agendamento':        { borda: 'border-t-brand-500',  header: 'bg-brand-50',  dot: 'bg-brand-500',  texto: 'text-brand-700'  },
  'Primeira Sessão':    { borda: 'border-t-indigo-400', header: 'bg-indigo-50', dot: 'bg-indigo-400', texto: 'text-indigo-700' },
  'Paciente Ativo':     { borda: 'border-t-green-500',  header: 'bg-green-50',  dot: 'bg-green-500',  texto: 'text-green-700'  },
  'Aguardando Retorno': { borda: 'border-t-amber-400',  header: 'bg-amber-50',  dot: 'bg-amber-400',  texto: 'text-amber-700'  },
  'Alta/Encerrado':     { borda: 'border-t-teal-400',   header: 'bg-teal-50',   dot: 'bg-teal-400',   texto: 'text-teal-700'   },
  'Abandono':           { borda: 'border-t-red-400',    header: 'bg-red-50',    dot: 'bg-red-400',    texto: 'text-red-700'    },
};

const ETAPAS = Object.keys(COR_ETAPA);

export default function PipelinePage() {
  const navigate = useNavigate();
  const [funil, setFunil]           = useState({});
  const [loading, setLoading]       = useState(true);
  const [erro, setErro]             = useState('');
  const [arrastando, setArrastando] = useState(null);
  const [prontuarioAberto, setProntuarioAberto] = useState(null);

  async function carregar() {
    try {
      const { data } = await getFunil();
      setFunil(data);
    } catch { setErro('Erro ao carregar o pipeline.'); }
    finally  { setLoading(false); }
  }

  useEffect(() => { carregar(); }, []);

  function handleDragStart(paciente, etapaOrigem) {
    setArrastando({ paciente, etapaOrigem });
  }

  function handleDragOver(e) { e.preventDefault(); }

  async function handleDrop(etapaDestino) {
    if (!arrastando || arrastando.etapaOrigem === etapaDestino) return;
    const { paciente, etapaOrigem } = arrastando;
    setArrastando(null);

    // Atualiza visualmente de imediato
    setFunil(prev => {
      const novo = { ...prev };
      novo[etapaOrigem]  = novo[etapaOrigem].filter(p => p.id !== paciente.id);
      novo[etapaDestino] = [...(novo[etapaDestino] || []), { ...paciente, funil_etapa: etapaDestino }];
      return novo;
    });

    try {
      await moverEtapa(paciente.id, etapaDestino);
    } catch {
      setErro('Erro ao mover paciente.');
      carregar();
    }
  }

  const total = Object.values(funil).reduce((acc, arr) => acc + arr.length, 0);

  if (loading) return <Spinner />;

  return (
    // Usa h-screen e overflow-hidden no container pai para fixar na tela
    <div className="flex flex-col" style={{ height: 'calc(100vh - 48px)' }}>

      {/* Cabeçalho fixo */}
      <div className="mb-4 flex-shrink-0">
        <h2 className="text-2xl font-bold text-gray-900">Pipeline de pacientes</h2>
        <p className="text-gray-500 text-sm mt-1">
          {total} paciente(s) · Arraste os cards entre as etapas
        </p>
      </div>

      <Alert type="error" message={erro} />

      {/* Kanban com scroll horizontal APENAS no kanban, não na página toda */}
      <div
        className="flex gap-3 overflow-x-auto flex-1"
        style={{
          // Scroll suave
          scrollBehavior: 'smooth',
          // Esconde scrollbar no Firefox mas mantém funcional
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db #f9fafb',
          // Impede que o conteúdo "empurre" a página
          overflowY: 'hidden',
          paddingBottom: '8px',
        }}
      >
        {ETAPAS.map(etapa => {
          const cor       = COR_ETAPA[etapa];
          const pacientes = funil[etapa] || [];

          return (
            <div
              key={etapa}
              // flex-shrink-0 e width fixo — cada coluna tem largura fixa e não estica
              className={`flex-shrink-0 flex flex-col border border-gray-200 rounded-xl border-t-4 ${cor.borda} bg-gray-50`}
              style={{ width: '200px', minHeight: '200px' }}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(etapa)}
            >
              {/* Cabeçalho da coluna */}
              <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-lg ${cor.header} border-b border-gray-200`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cor.dot}`} />
                  <span className={`text-xs font-semibold leading-tight ${cor.texto}`}>{etapa}</span>
                </div>
                <span className={`text-xs font-bold ${cor.texto} ml-1`}>{pacientes.length}</span>
              </div>

              {/* Cards com scroll vertical dentro da coluna */}
              <div
                className="flex-1 p-2 space-y-2 overflow-y-auto"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}
              >
                {pacientes.length === 0 && (
                  <div className="text-center text-gray-300 text-xs py-6 border-2 border-dashed border-gray-200 rounded-lg">
                    Vazio
                  </div>
                )}

                {pacientes.map(p => (
                  <div
                    key={p.id}
                    className="bg-white border border-gray-200 rounded-lg p-3 cursor-grab hover:border-brand-400 hover:shadow-sm transition-all duration-150 select-none"
                    draggable
                    onDragStart={() => handleDragStart(p, etapa)}
                  >
                    {/* Nome */}
                    <p className="text-sm font-semibold text-gray-900 truncate mb-1">{p.name}</p>

                    {/* Telefone */}
                    {p.phone && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                        <span>📞</span>{formatPhone(p.phone)}
                      </p>
                    )}

                    {/* E-mail */}
                    {p.email && (
                      <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                        <span>✉</span>{p.email}
                      </p>
                    )}

                    {/* Ações */}
                    <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => navigate(`/patients/${p.id}`)}
                        className="text-xs text-gray-400 hover:text-brand-600 transition-colors"
                      >
                        Ver
                      </button>
                      <span className="text-gray-200">·</span>
                      <button
                        onClick={() => setProntuarioAberto(p)}
                        className="text-xs text-gray-400 hover:text-brand-600 transition-colors"
                      >
                        Prontuário
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de prontuário */}
      {prontuarioAberto && (
        <ModalProntuario
          paciente={prontuarioAberto}
          onClose={() => setProntuarioAberto(null)}
        />
      )}
    </div>
  );
}
