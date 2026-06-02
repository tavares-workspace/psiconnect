import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Alert from '../components/Alert';
import Logo from '../components/Logo';

export default function ResetSenhaPage() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const token      = params.get('token');

  const [tokenValido, setTokenValido] = useState(null);
  const [novaSenha, setNovaSenha]     = useState('');
  const [confirmar, setConfirmar]     = useState('');
  const [msg, setMsg]                 = useState({ type:'', text:'' });
  const [loading, setLoading]         = useState(false);
  const [concluido, setConcluido]     = useState(false);

  useEffect(() => {
    if (!token) { setTokenValido(false); return; }
    api.get(`/reset/validar?token=${token}`)
      .then(() => setTokenValido(true))
      .catch(() => setTokenValido(false));
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg({ type:'', text:'' });

    if (novaSenha !== confirmar) {
      setMsg({ type:'error', text:'As senhas não coincidem.' });
      return;
    }
    if (novaSenha.length < 6) {
      setMsg({ type:'error', text:'Senha deve ter ao menos 6 caracteres.' });
      return;
    }
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(novaSenha)) {
      setMsg({ type:'error', text:'Senha deve conter ao menos uma letra e um número.' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/reset/redefinir', { token, novaSenha });
      setConcluido(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setMsg({ type:'error', text: err.response?.data?.message || 'Erro ao redefinir. Tente novamente.' });
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ width:'100%', maxWidth:'400px' }}>
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <Logo size={40} showText={true} />
        </div>

        <div className="card">
          {tokenValido === null && (
            <p className="text-sm text-gray-400 text-center">Validando link...</p>
          )}

          {tokenValido === false && (
            <div style={{ textAlign:'center' }}>
              <p className="text-gray-800 font-medium mb-2">Link inválido ou expirado</p>
              <p className="text-sm text-gray-400 mb-5">
                Solicite um novo link de redefinição de senha.
              </p>
              <Link to="/esqueci-senha" className="btn-primary text-sm" style={{ justifyContent:'center' }}>
                Solicitar novo link
              </Link>
            </div>
          )}

          {tokenValido === true && !concluido && (
            <>
              <h2 className="text-base font-semibold text-gray-800 mb-1">Nova senha</h2>
              <p className="text-sm text-gray-400 mb-5">Defina sua nova senha de acesso.</p>

              <Alert type={msg.type} message={msg.text} />

              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                <div>
                  <label className="label">Nova senha</label>
                  <input type="password" value={novaSenha}
                    onChange={e => setNovaSenha(e.target.value)}
                    required className="input" placeholder="Mínimo 6 caracteres, com letras e números" autoFocus />
                </div>
                <div>
                  <label className="label">Confirmar senha</label>
                  <input type="password" value={confirmar}
                    onChange={e => setConfirmar(e.target.value)}
                    required className="input" placeholder="Repita a nova senha" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent:'center' }}>
                  {loading ? 'Salvando...' : 'Salvar nova senha'}
                </button>
              </form>
            </>
          )}

          {concluido && (
            <div style={{ textAlign:'center' }}>
              <p className="text-gray-800 font-medium mb-2">Senha redefinida!</p>
              <p className="text-sm text-gray-400">Você será redirecionado para o login em instantes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
