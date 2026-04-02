// Controller de prontuários
const prontuarioService = require('../services/prontuarioService');
const patientModel      = require('../models/patientModel');
const userModel         = require('../models/userModel');
const path              = require('path');
const fs                = require('fs');

// GET /api/prontuarios/:patientId
async function buscar(req, res, next) {
  try {
    const prontuario = await prontuarioService.buscar(req.params.patientId, req.user.id);
    return res.status(200).json(prontuario || {});
  } catch (e) { next(e); }
}

// POST /api/prontuarios/:patientId
async function salvar(req, res, next) {
  try {
    const { evolucao }  = req.body;
    const contratoPath  = req.file ? req.file.path : null;
    const contratoNome  = req.file ? req.file.originalname : null;

    const prontuario = await prontuarioService.salvar(
      req.params.patientId, req.user.id, evolucao, contratoPath, contratoNome
    );
    return res.status(200).json({ message: 'Prontuário salvo!', prontuario });
  } catch (e) { next(e); }
}

// GET /api/prontuarios/:patientId/download-evolucao
// Gera um PDF com dados do psicólogo, paciente e evolução clínica
async function downloadEvolucao(req, res, next) {
  try {
    // Busca dados necessários em paralelo
    const [prontuario, paciente, psicologo] = await Promise.all([
      prontuarioService.buscar(req.params.patientId, req.user.id),
      patientModel.findById(req.params.patientId, req.user.id),
      userModel.findById(req.user.id),
    ]);

    if (!paciente) return res.status(404).json({ message: 'Paciente não encontrado.' });

    // Importa PDFKit
    const PDFDocument = require('pdfkit');

    // Configura o PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Cabeçalho HTTP para download
    const nomeArquivo = `prontuario_${paciente.name.replace(/\s/g, '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`);

    // Envia o PDF diretamente para o response
    doc.pipe(res);

    // ── Cabeçalho do documento ──────────────────────────────────────────
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .fillColor('#0d9488')
      .text('PsiConnect', { align: 'center' });

    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .fillColor('#111827')
      .text('PRONTUÁRIO CLÍNICO', { align: 'center' });

    doc.moveDown(0.5);

    // Linha separadora
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').stroke();
    doc.moveDown(1);

    // ── Dados do psicólogo ──────────────────────────────────────────────
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#374151')
      .text('DADOS DO PROFISSIONAL');

    doc.moveDown(0.3);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#374151');

    doc.text(`Nome: ${psicologo?.name || '—'}`);
    if (psicologo?.crp)   doc.text(`CRP: ${psicologo.crp}`);
    if (psicologo?.phone) doc.text(`Telefone: ${psicologo.phone}`);
    if (psicologo?.email) doc.text(`E-mail: ${psicologo.email}`);

    doc.moveDown(1);

    // Linha separadora
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').stroke();
    doc.moveDown(1);

    // ── Dados do paciente ───────────────────────────────────────────────
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#374151')
      .text('DADOS DO PACIENTE');

    doc.moveDown(0.3);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#374151');

    doc.text(`Nome: ${paciente.name}`);
    if (paciente.email)      doc.text(`E-mail: ${paciente.email}`);
    if (paciente.phone)      doc.text(`Telefone: ${paciente.phone}`);
    if (paciente.birth_date) doc.text(`Data de nascimento: ${new Date(paciente.birth_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`);
    if (paciente.cpf)        doc.text(`CPF: ${paciente.cpf}`);
    if (paciente.address)    doc.text(`Endereço: ${paciente.address}`);
    if (paciente.funil_etapa) doc.text(`Etapa no funil: ${paciente.funil_etapa}`);

    doc.moveDown(1);

    // Linha separadora
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').stroke();
    doc.moveDown(1);

    // ── Evolução clínica ────────────────────────────────────────────────
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#374151')
      .text('EVOLUÇÃO CLÍNICA');

    doc.moveDown(0.3);

    if (prontuario?.evolucao) {
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#374151')
        .text(prontuario.evolucao, {
          align: 'justify',
          lineGap: 4,
        });
    } else {
      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#9ca3af')
        .text('Nenhuma evolução clínica registrada.');
    }

    doc.moveDown(2);

    // ── Rodapé ──────────────────────────────────────────────────────────
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').stroke();
    doc.moveDown(0.5);

    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#9ca3af')
      .text(
        `Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} — PsiConnect`,
        { align: 'center' }
      );

    // Finaliza o PDF
    doc.end();

  } catch (e) { next(e); }
}

// GET /api/prontuarios/:patientId/download
// Baixa o contrato terapêutico
async function downloadContrato(req, res, next) {
  try {
    const prontuario = await prontuarioService.buscar(req.params.patientId, req.user.id);
    if (!prontuario || !prontuario.contrato_path) {
      return res.status(404).json({ message: 'Nenhum contrato anexado.' });
    }

    const filePath = path.resolve(prontuario.contrato_path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Arquivo não encontrado no servidor.' });
    }

    return res.download(filePath, prontuario.contrato_nome);
  } catch (e) { next(e); }
}

module.exports = { buscar, salvar, downloadEvolucao, downloadContrato };
