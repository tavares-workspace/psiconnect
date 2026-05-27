import { useEffect, useState } from 'react';
import { getProfile, updateProfile, changePassword, deleteAccount } from '../services/authService';
import api from '../services/api';
import { saveAuth, getToken, clearAuth } from '../utils/authUtils';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';

export default function SettingsPage() {
  const [perfil, setPerfil]       = useState({ name:'', email:'', crp:'', phone:'' });
  const [senhaForm, setSenhaForm] = useState({ currentPassword:'', newPassword:'', confirmar:'' });
  const [loading, setLoading]     = useState(true);
  const [salvando, setSalvando]   = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [msgPerfil, setMsgPerfil]     = useState({ type:'', text:'' });
  const [msgSenha, setMsgSenha]       = useState({ type:'', text:'' });
  const [msgCalendar, setMsgCalendar] = useState({ type:'', text:'' });
  const [calendarConectado, setCalendarConectado] = useState(null);
  const [conectando, setConectando]   = useState(false);

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

    const params         = new URLSearchParams(window.location.search);
    const calendarResult = params.get('calendar');
    const calendarMsg    = params.get('msg');

    if (calendarResult === 'connected') {
      setCalendarConectado(true);
      setMsgCalendar({ type: 'success', text: 'Google Calendar conectado com sucesso!' });
    } else if (calendarResult === 'denied') {
      setMsgCalendar({ type: 'error', text: 'Acesso negado pelo Google.' });
    } else if (calendarResult === 'error') {
      const msg = decodeURIComponent(calendarMsg || 'erro desconhecido');
      const texto = msg.includes('refresh_token') || msg.includes('myaccount')
        ? 'Token não retornado. Acesse myaccount.google.com/permissions, remova o PsiConnect e tente novamente.'
        : `Erro ao conectar: ${msg}`;
      setMsgCalendar({ type: 'error', text: texto });
    }

    if (calendarResult) window.history.replaceState({}, '', '/settings');
  }, []);

  async function handleSalvarPerfil(e) {
    e.preventDefault();
    setSalvando(true);
    setMsgPerfil({ type:'', text:'' });
    try {
      const { data } = await updateProfile(perfil);
      saveAuth(getToken(), data.usuario);
      setMsgPerfil({ type:'success', text:'Perfil atualizado!' });
    } catch (err) {
      setMsgPerfil({ type:'error', text: err.response?.data?.message || 'Erro ao salvar.' });
    } finally { setSalvando(false); }
  }

  async function handleAlterarSenha(e) {
    e.preventDefault();
    if (senhaForm.newPassword !== senhaForm.confirmar) {
      setMsgSenha({ type:'error', text:'As senhas não coincidem.' });
      return;
    }
    setSalvandoSenha(true);
    setMsgSenha({ type:'', text:'' });
    try {
      await changePassword({ currentPassword: senhaForm.currentPassword, newPassword: senhaForm.newPassword });
      setMsgSenha({ type:'success', text:'Senha alterada!' });
      setSenhaForm({ currentPassword:'', newPassword:'', confirmar:'' });
    } catch (err) {
      setMsgSenha({ type:'error', text: err.response?.data?.message || 'Erro ao alterar.' });
    } finally { setSalvandoSenha(false); }
  }

  async function handleConectarCalendar() {
    setConectando(true);
    setMsgCalendar({ type:'', text:'' });
    try {
      const { data } = await api.get('/calendar/auth-url');
      window.location.href = data.url;
    } catch (err) {
      setMsgCalendar({ type:'error', text: err.response?.data?.message || 'Erro ao conectar.' });
      setConectando(false);
    }
  }

  async function handleDesconectar() {
    if (!confirm('Desconectar o Google Calendar?')) return;
    try {
      await api.delete('/calendar/disconnect');
      setCalendarConectado(false);
      setMsgCalendar({ type:'success', text:'Google Calendar desconectado.' });
    } catch {
      setMsgCalendar({ type:'error', text:'Erro ao desconectar.' });
    }
  }

  async function handleExcluirConta() {
    const confirmado = window.confirm(
      'Tem certeza que deseja encerrar sua conta? Seus dados pessoais serão removidos permanentemente. Esta ação não pode ser desfeita.'
    );
    if (!confirmado) return;

    const segunda = window.confirm(
      'Esta é a confirmação final. Ao continuar, todos os seus dados pessoais e dos seus pacientes serão apagados. Deseja prosseguir?'
    );
    if (!segunda) return;

    try {
      await deleteAccount();
      clearAuth();
      navigate('/login');
    } catch {
      setMsgPerfil({ type: 'error', text: 'Erro ao encerrar conta. Tente novamente.' });
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="max-w-lg space-y-5">
      <h2 className="text-xl font-bold text-gray-900">Configurações</h2>

      {/* Perfil */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Meu perfil</h3>
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
          </div>
          <div className="grid grid-cols-2 gap-3">
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
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      </div>

      {/* Alterar senha */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Alterar senha</h3>
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
            {salvandoSenha ? 'Salvando...' : 'Alterar senha'}
          </button>
        </form>
      </div>

      {/* Google Calendar */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-1">Google Calendar</h3>
        <p className="text-sm text-gray-400 mb-4">
          Consultas agendadas criam eventos automaticamente com link do Google Meet
          e enviam convite ao paciente.
        </p>

        <Alert type={msgCalendar.type} message={msgCalendar.text} />

        {calendarConectado === null ? (
          <Spinner text="Verificando..." />
        ) : calendarConectado ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Conectado
            </div>
            <button onClick={handleDesconectar} className="btn-danger text-xs">
              Desconectar
            </button>
          </div>
        ) : (
          <>
            <button onClick={handleConectarCalendar} disabled={conectando} className="btn-primary">
              {conectando ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Redirecionando...
                </span>
              ) : 'Conectar Google Calendar'}
            </button>
            <div className="mt-3 text-xs text-gray-400 space-y-1">
              <p>Você será redirecionado para o Google para autorizar.</p>
              <p>
                Problemas? Acesse{' '}
                <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer"
                  className="text-brand-600 underline">
                  myaccount.google.com/permissions
                </a>
                , remova o PsiConnect e tente novamente.
              </p>
            </div>
          </>
        )}
      </div>
      {/* Encerramento de conta — LGPD */}
      <div className="card" style={{ borderColor: 'var(--color-border-danger)' }}>
        <h3 className="font-semibold text-gray-800 mb-1">Encerrar conta</h3>
        <p className="text-sm text-gray-400 mb-4">
          Ao encerrar sua conta, seus dados pessoais e os dados dos seus pacientes serão removidos permanentemente,
          conforme a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018).
          Registros estatísticos anonimizados podem ser mantidos.
        </p>
        <button onClick={handleExcluirConta} className="btn-danger text-sm">
          Encerrar minha conta
        </button>
      </div>
    </div>
  );
}
