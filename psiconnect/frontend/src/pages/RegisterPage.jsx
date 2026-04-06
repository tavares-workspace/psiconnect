import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/authService';
import { saveAuth } from '../utils/authUtils';
import Alert from '../components/Alert';
import Logo from '../components/Logo';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name:'', email:'', password:'', crp:'', phone:'' });
  const [erro, setErro]       = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault(); setErro('');
    if (form.password.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return; }
    setLoading(true);
    try {
      const { data } = await register(form);
      saveAuth(data.token, data.usuario);
      navigate('/dashboard');
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao criar conta.');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo size={52} showText={true} />
        </div>

        <div className="card">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Criar conta</h1>
          <p className="text-sm text-gray-500 mb-6">Comece a usar o PsiConnect hoje</p>

          <Alert type="error" message={erro} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nome completo *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange}
                required className="input" placeholder="Dr(a). Seu Nome" />
            </div>
            <div>
              <label className="label">E-mail *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                required className="input" placeholder="seu@email.com" />
            </div>
            <div>
              <label className="label">Senha *</label>
              <input type="password" name="password" value={form.password} onChange={handleChange}
                required className="input" placeholder="Mínimo 6 caracteres" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">CRP</label>
                <input type="text" name="crp" value={form.crp} onChange={handleChange}
                  className="input" placeholder="00/00000" />
              </div>
              <div>
                <label className="label">Telefone</label>
                <input type="text" name="phone" value={form.phone} onChange={handleChange}
                  className="input" placeholder="(11) 99999-9999" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Já tem conta?{' '}
            <Link to="/login" className="text-brand-600 font-medium hover:text-brand-700">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
