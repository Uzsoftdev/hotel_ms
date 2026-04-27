import api from './api';

export const getAssignedBookings = (status) =>
  api.get('/admin/bookings/', { params: status ? { status } : {} });
export const checkInGuest = (id) => api.put(`/admin/bookings/${id}/checkin`);
export const checkOutGuest = (id) => api.put(`/admin/bookings/${id}/checkout`);

export const getRooms = () => api.get('/admin/rooms/');
export const updateRoomStatus = (id, data) => api.put(`/admin/rooms/${id}`, data);

export const getDailySummary = () => api.get('/admin/reports/occupancy', { params: { days: 1 } });
