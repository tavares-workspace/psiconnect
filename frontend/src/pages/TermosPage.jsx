import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function TermosPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/register" style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>← Voltar ao cadastro</Link>
      </div>
      <Logo size={32} showText={true} />
      <h1 style={{ fontSize: '22px', fontWeight: '500', marginTop: '20px', marginBottom: '6px' }}>Termos de Uso</h1>
      <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '28px' }}>Última atualização: maio de 2026</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '14px', lineHeight: '1.7', color: 'var(--color-text-secondary)' }}>
        <section>
          <h2 style={{ fontSize: '15px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '8px' }}>1. Aceitação</h2>
          <p>Ao criar uma conta no PsiConnect, você declara ter lido, compreendido e aceito estes Termos de Uso. O uso do sistema implica concordância integral com as condições aqui descritas.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '15px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '8px' }}>2. Descrição do serviço</h2>
          <p>O PsiConnect é um sistema de gestão clínica destinado exclusivamente a psicólogos autônomos. O sistema permite o cadastro e acompanhamento de pacientes, agendamento de consultas, registro de prontuários eletrônicos, geração de relatórios e integração com o Google Calendar.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '15px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '8px' }}>3. Responsabilidades do usuário</h2>
          <p>O psicólogo é responsável pela veracidade e atualização das informações cadastradas, pela confidencialidade de seus dados de acesso e pelo uso do sistema em conformidade com o Código de Ética Profissional do Psicólogo e com a Resolução CFP nº 11/2018, que regulamenta a prestação de serviços psicológicos por meios digitais.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '15px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '8px' }}>4. Propriedade dos dados</h2>
          <p>Os dados inseridos no sistema pertencem exclusivamente ao psicólogo usuário. O PsiConnect não comercializa, compartilha ou utiliza os dados clínicos dos pacientes para qualquer finalidade além do funcionamento do sistema.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '15px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '8px' }}>5. Encerramento de conta</h2>
          <p>O usuário pode solicitar o encerramento de sua conta a qualquer momento nas Configurações do sistema. Ao encerrar a conta, os dados pessoais identificáveis do psicólogo e de seus pacientes serão removidos ou anonimizados, conforme descrito na Política de Privacidade. Registros estatísticos não identificáveis poderão ser mantidos.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '15px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '8px' }}>6. Modificações</h2>
          <p>Estes Termos podem ser atualizados periodicamente. Alterações relevantes serão comunicadas ao usuário por e-mail ou pelo próprio sistema. O uso continuado após a notificação implica aceitação das novas condições.</p>
        </section>
      </div>
    </div>
  );
}
