import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { saveAuth } from '../utils/authUtils';
import Alert from '../components/Alert';
import Logo from '../components/Logo';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro]         = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(''); setLoading(true);
    try {
      const { data } = await login({ email, password });
      saveAuth(data.token, data.usuario);
      navigate('/dashboard');
    } catch (err) {
      setErro(err.response?.data?.message || 'E-mail ou senha incorretos.');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo centralizado */}
        <div className="flex justify-center mb-8">
          <Logo size={52} showText={true} />
        </div>

        <div className="card">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Bem-vindo de volta</h1>
          <p className="text-sm text-gray-500 mb-6">Acesse sua conta para continuar</p>

          <Alert type="error" message={erro} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input" placeholder="seu@email.com" required autoFocus />
            </div>
            <div>
              <label className="label">Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="input" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Não tem conta?{' '}
            <Link to="/register" className="text-brand-600 font-medium hover:text-brand-700">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
