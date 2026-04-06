import api from './api';

export const getNotesByAppointment = (appointmentId) => api.get(`/notes/appointment/${appointmentId}`);
export const getHistoryByPatient   = (patientId)     => api.get(`/notes/patient/${patientId}`);
export const createNote            = (appointmentId, content) => api.post(`/notes/appointment/${appointmentId}`, { content });
export const updateNote            = (id, content)   => api.put(`/notes/${id}`, { content });
export const deleteNote            = (id)            => api.delete(`/notes/${id}`);
