import { useEffect, useState } from 'react';
import { getProfile, updateProfile, changePassword } from '../services/authService';
import api from '../services/api';
import { saveAuth, getToken } from '../utils/authUtils';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

export default function SettingsPage() {
  const [perfil, setPerfil]       = useState({ name:'', email:'', crp:'', phone:'' });
  const [senhaForm, setSenhaForm] = useState({ currentPassword:'', newPassword:'', confirmar:'' });
  const [loading, setLoading]     = useState(true);
  const [salvando, setSalvando]   = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [msgPerfil, setMsgPerfil] = useState({ type:'', text:'' });
  const [msgSenha, setMsgSenha]   = useState({ type:'', text:'' });
  const [msgCalendar, setMsgCalendar] = useState({ type:'', text:'' });
  const [calendarConectado, setCalendarConectado] = useState(null);
  const [conectando, setConectando] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        const [{ data: u }, { data: cal }] = await Promise.all([
          getProfile(),
          api.get('/calendar/status'),
        ]);
        setPerfil({ name: u.name, email: u.email, crp: u.crp || '', phone: u.phone || '' });
        setCalendarConectado(cal.connected);
      } catch {
        setMsgPerfil({ type: 'error', text: 'Erro ao carregar perfil.' });
      } finally {
        setLoading(false);
      }
    }
    carregar();

    // Trata o resultado do callback OAuth do Google
    const params         = new URLSearchParams(window.location.search);
    const calendarResult = params.get('calendar');
    const calendarMsg    = params.get('msg');

    if (calendarResult === 'connected') {
      setCalendarConectado(true);
      setMsgCalendar({ type: 'success', text: '✓ Google Calendar conectado com sucesso! Suas consultas serão sincronizadas automaticamente.' });
    } else if (calendarResult === 'denied') {
      setMsgCalendar({ type: 'error', text: 'Acesso negado pelo Google. Você precisará autorizar o PsiConnect para usar essa integração.' });
    } else if (calendarResult === 'error') {
      const msg = decodeURIComponent(calendarMsg || 'erro desconhecido');
      // Detecta o erro específico de refresh_token ausente e exibe instrução clara
      if (msg.includes('refresh_token') || msg.includes('myaccount.google.com')) {
        setMsgCalendar({
          type: 'error',
          text: 'O Google não retornou o token de autorização. Para resolver: acesse myaccount.google.com/permissions, remova o PsiConnect da lista de apps e tente conectar novamente.',
        });
      } else {
        setMsgCalendar({ type: 'error', text: `Erro ao conectar: ${msg}` });
      }
    }

    if (calendarResult) {
      window.history.replaceState({}, '', '/settings');
    }
  }, []);

  async function handleSalvarPerfil(e) {
    e.preventDefault();
    setSalvando(true);
    setMsgPerfil({ type:'', text:'' });
    try {
      const { data } = await updateProfile(perfil);
      saveAuth(getToken(), data.usuario);
      setMsgPerfil({ type:'success', text:'Perfil atualizado com sucesso!' });
    } catch (err) {
      setMsgPerfil({ type:'error', text: err.response?.data?.message || 'Erro ao salvar.' });
    } finally { setSalvando(false); }
  }

  async function handleAlterarSenha(e) {
    e.preventDefault();
    if (senhaForm.newPassword !== senhaForm.confirmar) {
      setMsgSenha({ type:'error', text:'As senhas não coincidem.' }); return;
    }
    setSalvandoSenha(true);
    setMsgSenha({ type:'', text:'' });
    try {
      await changePassword({ currentPassword: senhaForm.currentPassword, newPassword: senhaForm.newPassword });
      setMsgSenha({ type:'success', text:'Senha alterada com sucesso!' });
      setSenhaForm({ currentPassword:'', newPassword:'', confirmar:'' });
    } catch (err) {
      setMsgSenha({ type:'error', text: err.response?.data?.message || 'Erro ao alterar senha.' });
    } finally { setSalvandoSenha(false); }
  }

  async function handleConectarCalendar() {
    setConectando(true);
    setMsgCalendar({ type:'', text:'' });
    try {
      const { data } = await api.get('/calendar/auth-url');
      // Redireciona para a tela de autorização do Google
      window.location.href = data.url;
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao iniciar conexão com o Google.';
      setMsgCalendar({ type:'error', text: msg });
      setConectando(false);
    }
  }

  async function handleDesconectarCalendar() {
    if (!confirm('Desconectar o Google Calendar? As consultas futuras não serão mais sincronizadas.')) return;
    try {
      await api.delete('/calendar/disconnect');
      setCalendarConectado(false);
      setMsgCalendar({ type:'success', text:'Google Calendar desconectado com sucesso.' });
    } catch {
      setMsgCalendar({ type:'error', text:'Erro ao desconectar. Tente novamente.' });
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>

      {/* ── Perfil ─────────────────────────────────────────────── */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Meu perfil</h3>
        <Alert type={msgPerfil.type} message={msgPerfil.text} />
        <form onSubmit={handleSalvarPerfil} className="space-y-4">
          <div>
            <label className="label">Nome completo *</label>
            <input type="text" value={perfil.name}
              onChange={e => setPerfil({ ...perfil, name: e.target.value })}
              required className="input" />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input type="email" value={perfil.email} disabled
              className="input bg-gray-50 text-gray-400 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">O e-mail não pode ser alterado.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">CRP</label>
              <input type="text" value={perfil.crp}
                onChange={e => setPerfil({ ...perfil, crp: e.target.value })}
                className="input" placeholder="00/00000" />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input type="text" value={perfil.phone}
                onChange={e => setPerfil({ ...perfil, phone: e.target.value })}
                className="input" placeholder="(11) 99999-9999" />
            </div>
          </div>
          <button type="submit" disabled={salvando} className="btn-primary">
            {salvando ? 'Salvando...' : 'Salvar perfil'}
          </button>
        </form>
      </div>

      {/* ── Alterar senha ──────────────────────────────────────── */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Alterar senha</h3>
        <Alert type={msgSenha.type} message={msgSenha.text} />
        <form onSubmit={handleAlterarSenha} className="space-y-4">
          {[
            { label:'Senha atual',     name:'currentPassword' },
            { label:'Nova senha',      name:'newPassword'     },
            { label:'Confirmar senha', name:'confirmar'       },
          ].map(f => (
            <div key={f.name}>
              <label className="label">{f.label}</label>
              <input type="password" value={senhaForm[f.name]}
                onChange={e => setSenhaForm({ ...senhaForm, [f.name]: e.target.value })}
                required className="input" placeholder="••••••••" />
            </div>
          ))}
          <button type="submit" disabled={salvandoSenha} className="btn-primary">
            {salvandoSenha ? 'Alterando...' : 'Alterar senha'}
          </button>
        </form>
      </div>

      {/* ── Google Calendar ────────────────────────────────────── */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-1">Google Calendar</h3>
        <p className="text-sm text-gray-500 mb-4">
          Ao conectar, cada consulta agendada cria automaticamente um evento no seu Google Calendar
          com o nome <strong>"Sessão de Psicologia - [nome do paciente]"</strong> e envia um
          convite ao e-mail do paciente (quando cadastrado).
        </p>

        <Alert type={msgCalendar.type} message={msgCalendar.text} />

        {calendarConectado === null ? (
          <Spinner text="Verificando conexão..." />
        ) : calendarConectado ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              Google Calendar conectado
            </div>
            <button onClick={handleDesconectarCalendar} className="btn-danger text-xs">
              Desconectar
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={handleConectarCalendar}
              disabled={conectando}
              className="btn-primary"
            >
              {conectando ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Redirecionando para o Google...
                </span>
              ) : (
                <>📅 Conectar Google Calendar</>
              )}
            </button>
            <p className="text-xs text-gray-400 mt-2">
              Você será redirecionado para o Google para autorizar o acesso.
            </p>
          </div>
        )}
      </div>

      {/* ── Instruções ─────────────────────────────────────────── */}
      {!calendarConectado && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-blue-800 text-sm mb-2">
            Como funciona a integração
          </h4>
          <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
            <li>Clique em "Conectar Google Calendar"</li>
            <li>Faça login com sua conta Google pessoal</li>
            <li>Autorize o PsiConnect a criar e gerenciar eventos</li>
            <li>Pronto — consultas agendadas criam eventos automaticamente</li>
          </ol>
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs text-blue-600 font-medium mb-1">Problema ao conectar?</p>
            <p className="text-xs text-blue-600">
              Se aparecer erro de token, acesse{' '}
              <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer"
                className="underline font-medium">
                myaccount.google.com/permissions
              </a>
              , remova o acesso do PsiConnect e tente conectar novamente.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
