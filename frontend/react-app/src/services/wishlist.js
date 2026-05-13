import api from './api';

export const getSavedRooms = () => api.get('/user/wishlist/rooms');
export const saveRoom = (roomId) => api.post(`/user/wishlist/rooms/${roomId}`);
export const unsaveRoom = (roomId) => api.delete(`/user/wishlist/rooms/${roomId}`);
