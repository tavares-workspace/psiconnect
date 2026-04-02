// Funções para salvar e recuperar os dados de autenticação no localStorage do navegador

const TOKEN_KEY = 'psiconnect_token';
const USER_KEY  = 'psiconnect_user';

// Salva o token e os dados do usuário após login/cadastro
export function saveAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Retorna o token JWT salvo
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Retorna os dados do usuário logado
export function getUser() {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

// Remove tudo (logout)
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Retorna true se o usuário estiver logado
export function isAuthenticated() {
  return !!getToken();
}
