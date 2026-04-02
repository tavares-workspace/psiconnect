# PsiConnect — Regra de Negócio: Funil Clínico com Pipeline Kanban

## Sobre esta branch
Esta branch contém a implementação completa da regra de negócio do **Pipeline Kanban com Funil Clínico Automatizado**, desenvolvida por Nathan Tavares da Silva como parte do TCC de Engenharia de Software — UMC 2026.

## Regra de negócio implementada
O sistema gerencia a evolução clínica de pacientes por meio de 8 etapas:

**Interessado → Triagem → Agendamento → Primeira Sessão → Paciente Ativo → Aguardando Retorno → Alta/Encerrado → Abandono**

### Automações do backend
- Ao **agendar** uma consulta com paciente em *Interessado* ou *Triagem* → avança para **Agendamento**
- Ao **agendar** com paciente em *Primeira Sessão* → avança para **Paciente Ativo**
- Ao **concluir** uma consulta com paciente em *Agendamento* → avança para **Primeira Sessão**

### Arquivos principais
- `backend/src/models/patientModel.js` — etapas do funil e lógica de avanço
- `backend/src/services/appointmentService.js` — regras de transição automática
- `backend/src/controllers/funilController.js` — endpoints do pipeline
- `backend/src/routes/funilRoutes.js` — rotas da API

## Tecnologias
- Node.js + Express
- PostgreSQL (Railway)
- Padrão MVC com camada de Services

## Orientador
Prof. Alessandro Aparecido da Silva Horas — UMC 2026
