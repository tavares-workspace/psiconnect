const sgMail = require('@sendgrid/mail');

const REMETENTE = 'tavares.workspace@gmail.com';

async function enviarResetSenha(destinatario, nome, token) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const link = `${process.env.FRONTEND_URL}/reset-senha?token=${token}`;

  await sgMail.send({
    to:      destinatario,
    from:    { email: REMETENTE, name: 'PsiConnect' },
    subject: 'Redefinicao de senha - PsiConnect',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;color:#1e293b">
        <h2 style="color:#0d9488">PsiConnect</h2>
        <p>Ola, ${nome}.</p>
        <p>Recebemos uma solicitacao de redefinicao de senha para sua conta.</p>
        <p>Clique no link abaixo para definir uma nova senha:</p>
        <p style="margin:24px 0">
          <a href="${link}" style="background:#0d9488;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
            Redefinir senha
          </a>
        </p>
        <p style="color:#64748b;font-size:13px">
          Este link e valido por 1 hora. Se voce nao solicitou a redefinicao, ignore este e-mail.
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
        <p style="color:#94a3b8;font-size:12px">PsiConnect</p>
      </div>
    `,
  });
}

module.exports = { enviarResetSenha };
