import api from './api';

export const listPatients  = (search = '') => api.get('/patients', { params: { search } });
export const getPatient    = (id)           => api.get(`/patients/${id}`);
export const createPatient = (data)         => api.post('/patients', data);
export const updatePatient = (id, data)     => api.put(`/patients/${id}`, data);
export const deletePatient = (id)           => api.delete(`/patients/${id}`);
