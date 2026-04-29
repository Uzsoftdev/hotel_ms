import api from './api';

export const getSavedRooms = () => api.get('/wishlist/rooms');
export const saveRoom = (roomId) => api.post(`/wishlist/rooms/${roomId}`);
export const unsaveRoom = (roomId) => api.delete(`/wishlist/rooms/${roomId}`);
