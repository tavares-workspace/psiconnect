import api from './api';

export const listAppointments    = (params)  => api.get('/appointments', { params });
export const getAppointment      = (id)       => api.get(`/appointments/${id}`);
export const createAppointment   = (data)     => api.post('/appointments', data);
export const updateAppointment   = (id, data) => api.put(`/appointments/${id}`, data);
export const cancelAppointment   = (id)       => api.patch(`/appointments/${id}/cancel`);
export const completeAppointment = (id)       => api.patch(`/appointments/${id}/complete`);
