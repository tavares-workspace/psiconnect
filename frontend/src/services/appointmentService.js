import api from './api';

export const listAppointments  = (params)       => api.get('/appointments', { params });
export const getAppointment    = (id)            => api.get(`/appointments/${id}`);
export const createAppointment = (data)          => api.post('/appointments', data);
export const updateAppointment = (id, data, scope = 'one') =>
  api.put(`/appointments/${id}?scope=${scope}`, data);
export const cancelAppointment = (id, scope = 'one') =>
  api.delete(`/appointments/${id}?scope=${scope}`);
export const completeAppointment = (id) =>
  api.patch(`/appointments/${id}/complete`);
