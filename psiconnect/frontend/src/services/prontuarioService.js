import api from './api';

export const getProntuario    = (patientId)  => api.get(`/prontuarios/${patientId}`);

export const saveProntuario   = (patientId, formData) =>
  api.post(`/prontuarios/${patientId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Download do contrato terapêutico (PDF/Word)
export const downloadContrato = (patientId) =>
  api.get(`/prontuarios/${patientId}/download`, { responseType: 'blob' });

// Download da evolução clínica em PDF gerado pelo servidor
export const downloadEvolucao = (patientId) =>
  api.get(`/prontuarios/${patientId}/download-evolucao`, { responseType: 'blob' });
