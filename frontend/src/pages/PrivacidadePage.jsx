import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function PrivacidadePage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/register" style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>← Voltar ao cadastro</Link>
      </div>
      <Logo size={32} showText={true} />
      <h1 style={{ fontSize: '22px', fontWeight: '500', marginTop: '20px', marginBottom: '6px' }}>Política de Privacidade</h1>
      <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '28px' }}>Última atualização: maio de 2026 · Em conformidade com a Lei nº 13.709/2018 (LGPD)</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '14px', lineHeight: '1.7', color: 'var(--color-text-secondary)' }}>
        <section>
          <h2 style={{ fontSize: '15px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '8px' }}>1. Dados coletados</h2>
          <p>O PsiConnect coleta os seguintes dados do psicólogo: nome completo, endereço de e-mail, senha (armazenada exclusivamente como hash bcrypt), número de CRP e telefone. Os dados dos pacientes — nome, e-mail, telefone, CPF, data de nascimento, endereço e evolução clínica — são fornecidos pelo próprio psicólogo e tratados sob sua responsabilidade.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '15px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '8px' }}>2. Finalidade do tratamento</h2>
          <p>Os dados são utilizados exclusivamente para: autenticação e controle de acesso ao sistema, gestão clínica dos pacientes pelo psicólogo, geração de métricas e relatórios de uso próprio do profissional, e integração com o Google Calendar quando autorizada pelo usuário.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '15px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '8px' }}>3. Proteção dos dados</h2>
          <p>Senhas são armazenadas com hash bcrypt (custo 10) e nunca em texto puro. A evolução clínica dos prontuários é criptografada com AES-256-CBC antes do armazenamento. A conexão com o banco de dados é realizada via SSL obrigatório. Todos os dados são isolados por identificador de usuário — nenhum psicólogo acessa dados de outro.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '15px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '8px' }}>4. Compartilhamento</h2>
          <p>Os dados não são vendidos, cedidos ou compartilhados com terceiros para fins comerciais. O único serviço externo que pode receber dados é o Google Calendar, exclusivamente quando o usuário autoriza a integração via OAuth 2.0 e apenas para criação de eventos de consulta.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '15px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '8px' }}>5. Direitos do titular</h2>
          <p>Conforme a LGPD, o usuário tem direito a: acessar seus dados (via perfil no sistema), corrigir dados incompletos ou inexatos (via edição de perfil), e solicitar o encerramento da conta com remoção dos dados pessoais identificáveis (via Configurações). Dados estatísticos não identificáveis podem ser mantidos para fins de integridade do histórico.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '15px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '8px' }}>6. Exclusão de dados</h2>
          <p>Ao encerrar a conta, o sistema remove ou anonimiza: nome, e-mail, senha, CRP, telefone do psicólogo; nome, e-mail, telefone, CPF, endereço e data de nascimento dos pacientes; prontuários e evoluções clínicas; lembretes e tarefas; tokens de integração com o Google Calendar. Registros de agendamentos são mantidos de forma anonimizada para preservar a consistência das métricas históricas.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '15px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '8px' }}>7. Retenção</h2>
          <p>Os dados pessoais são mantidos enquanto a conta estiver ativa. Após o encerramento da conta, os dados identificáveis são removidos imediatamente. Registros anonimizados podem ser mantidos por prazo indeterminado.</p>
        </section>
      </div>
    </div>
  );
}
