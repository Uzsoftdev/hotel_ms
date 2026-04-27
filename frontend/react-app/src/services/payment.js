import api from './api';

export const processPayment = (data) => api.post('/user/payments/', data);
export const getPaymentHistory = () => api.get('/user/payments/');
