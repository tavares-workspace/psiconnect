import api from './api';
export const getTarefas    = ()   => api.get('/tarefas');
export const concluirTarefa = (id) => api.patch(`/tarefas/${id}/concluir`);
export const removerTarefa  = (id) => api.delete(`/tarefas/${id}`);
