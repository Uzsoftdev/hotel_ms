import api from './api';

export const login = ({ username, password }) => {
  // Backend expects { email, password } — map username → email
  return api.post('/public/auth/login', { email: username, password });
};

export const register = (data) => {
  return api.post('/public/auth/register', data);
};
