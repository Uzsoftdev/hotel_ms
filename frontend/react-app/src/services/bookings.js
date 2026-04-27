import api from './api';

export const createBooking = (data) => api.post('/user/bookings/', data);
export const getMyBookings = () => api.get('/user/bookings/');
export const getBooking = (id) => api.get(`/user/bookings/${id}`);
export const cancelBooking = (id) => api.put(`/user/bookings/${id}/cancel`);
