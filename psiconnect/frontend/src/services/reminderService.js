import api from './api';
export const listReminders  = ()         => api.get('/reminders');
export const createReminder = (data)     => api.post('/reminders', data);
export const updateReminder = (id, data) => api.put(`/reminders/${id}`, data);
export const deleteReminder = (id)       => api.delete(`/reminders/${id}`);
