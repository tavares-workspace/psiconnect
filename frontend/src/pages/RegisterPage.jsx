import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/authService';
import { saveAuth } from '../utils/authUtils';
import Alert from '../components/Alert';
import Logo from '../components/Logo';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', crp: '', phone: '' });
  const [aceite, setAceite] = useState(false);
  const [erro, setErro]     = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    if (!aceite) {
      setErro('Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await register({ ...form, aceite_termos: true });
      saveAuth(data.token, data.usuario);
      navigate('/dashboard');
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao cadastrar.');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Logo size={40} showText={true} />
          <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginTop: '6px' }}>
            Crie sua conta gratuita
          </p>
        </div>

        <div className="card">
          <Alert type="error" message={erro} />

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="label">Nome completo *</label>
              <input name="name" type="text" value={form.name} onChange={handleChange}
                required className="input" placeholder="Seu nome completo" />
            </div>
            <div>
              <label className="label">E-mail *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                required className="input" placeholder="seu@email.com" />
            </div>
            <div>
              <label className="label">Senha *</label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                required className="input" placeholder="Mínimo 6 caracteres" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label className="label">CRP</label>
                <input name="crp" type="text" value={form.crp} onChange={handleChange}
                  className="input" placeholder="00/00000" />
              </div>
              <div>
                <label className="label">Telefone</label>
                <input name="phone" type="text" value={form.phone} onChange={handleChange}
                  className="input" placeholder="(11) 99999-9999" />
              </div>
            </div>

            {/* Aceite dos termos — obrigatório pela LGPD */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '12px', background: 'var(--color-background-secondary)', borderRadius: '8px', border: '1px solid var(--color-border-tertiary)' }}>
              <input
                type="checkbox"
                id="aceite"
                checked={aceite}
                onChange={e => setAceite(e.target.checked)}
                style={{ marginTop: '2px', width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
              />
              <label htmlFor="aceite" style={{ fontSize: '12px', color: 'var(--color-text-secondary)', cursor: 'pointer', lineHeight: '1.5' }}>
                Li e aceito os{' '}
                <Link to="/termos" target="_blank" style={{ color: 'var(--color-text-info)', textDecoration: 'underline' }}>
                  Termos de Uso
                </Link>
                {' '}e a{' '}
                <Link to="/privacidade" target="_blank" style={{ color: 'var(--color-text-info)', textDecoration: 'underline' }}>
                  Política de Privacidade
                </Link>
                . Entendo como meus dados serão utilizados conforme a LGPD (Lei 13.709/2018).
              </label>
            </div>

            <button type="submit" disabled={loading || !aceite} className="btn-primary" style={{ justifyContent: 'center', marginTop: '4px' }}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-text-tertiary)', marginTop: '16px' }}>
            Já tem conta?{' '}
            <Link to="/login" style={{ color: 'var(--color-text-info)' }}>Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
