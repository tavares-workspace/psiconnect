import api from './api';
export const getFunil      = ()               => api.get('/funil');
export const moverEtapa    = (patientId, etapa) => api.patch(`/funil/${patientId}/etapa`, { etapa });
