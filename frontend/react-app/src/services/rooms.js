import api from './api';

export const searchRooms = (hotelId, checkIn, checkOut) =>
  api.get('/public/search/', { params: { hotel_id: hotelId, check_in: checkIn, check_out: checkOut } });

export const getAdminRooms = () => api.get('/admin/rooms/');
export const getRoom = (id) => api.get(`/admin/rooms/${id}`);
export const createRoom = (data) => api.post('/admin/rooms/', data);
export const updateRoom = (id, data) => api.put(`/admin/rooms/${id}`, data);
export const deleteRoom = (id) => api.delete(`/admin/rooms/${id}`);

export const getRoomTypes = () => api.get('/admin/room-types/');
export const createRoomType = (data) => api.post('/admin/room-types/', data);
export const updateRoomType = (id, data) => api.put(`/admin/room-types/${id}`, data);
export const deleteRoomType = (id) => api.delete(`/admin/room-types/${id}`);
