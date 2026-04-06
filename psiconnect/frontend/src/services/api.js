// Configura o Axios com a URL base da API e o token JWT automático

import axios from 'axios';
import { getToken, clearAuth } from '../utils/authUtils';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Antes de cada requisição, adiciona o token JWT no cabeçalho
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Se a API retornar 401 (não autorizado), faz logout e redireciona para o login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
