import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Alert from '../components/Alert';
import Logo from '../components/Logo';

export default function EsqueciSenhaPage() {
  const [email, setEmail]     = useState('');
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro]       = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      await api.post('/reset/solicitar', { email });
      setEnviado(true);
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao enviar. Tente novamente.');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ width:'100%', maxWidth:'400px' }}>
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <Logo size={40} showText={true} />
        </div>

        <div className="card">
          {enviado ? (
            <div style={{ textAlign:'center', padding:'8px 0' }}>
              <p className="text-gray-800 font-medium mb-2">Verifique seu e-mail</p>
              <p className="text-sm text-gray-400 mb-5">
                Se o endereço informado estiver cadastrado, você receberá as instruções em breve.
              </p>
              <Link to="/login" className="text-sm text-brand-600 underline">Voltar ao login</Link>
            </div>
          ) : (
            <>
              <h2 className="text-base font-semibold text-gray-800 mb-1">Esqueceu a senha?</h2>
              <p className="text-sm text-gray-400 mb-5">
                Informe seu e-mail e enviaremos um link para redefinir sua senha.
              </p>

              <Alert type="error" message={erro} />

              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                <div>
                  <label className="label">E-mail</label>
                  <input type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    required className="input" placeholder="seu@email.com" autoFocus />
                </div>
                <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent:'center' }}>
                  {loading ? 'Enviando...' : 'Enviar link'}
                </button>
              </form>

              <p style={{ textAlign:'center', fontSize:'13px', color:'var(--color-text-tertiary)', marginTop:'16px' }}>
                <Link to="/login" style={{ color:'var(--color-text-info)' }}>Voltar ao login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
