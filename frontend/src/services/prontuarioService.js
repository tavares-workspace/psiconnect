import api from './api';

export const getProntuario    = (patientId)  => api.get(`/prontuarios/${patientId}`);

export const saveProntuario   = (patientId, formData) =>
  api.post(`/prontuarios/${patientId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const downloadContrato = (patientId) =>
  api.get(`/prontuarios/${patientId}/download`, { responseType: 'blob' });

export const downloadEvolucao = (patientId) =>
  api.get(`/prontuarios/${patientId}/download-evolucao`, { responseType: 'blob' });
