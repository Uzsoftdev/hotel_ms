import api from './api';

export const getProfile = () => api.get('/user/profile/');
export const updateProfile = (data) => api.put('/user/profile/', data);
export const changePassword = (data) => api.put('/user/profile/change-password', data);
export const uploadProfilePhoto = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/user/profile/photo', form, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const getNotifications = () => api.get('/user/notifications/');
export const markNotificationRead = (id) => api.put(`/user/notifications/${id}/read`);
export const markAllRead = () => api.post('/user/notifications/read-all');

export const getMyReviews = () => api.get('/user/reviews/');
export const submitReview = (data) => api.post('/user/reviews/', data);
export const updateReview = (id, data) => api.put(`/user/reviews/${id}`, data);
export const deleteReview = (id) => api.delete(`/user/reviews/${id}`);

export const getWishlist = () => api.get('/user/wishlist/');
export const addToWishlist = (hotelId) => api.post(`/user/wishlist/${hotelId}`);
export const removeFromWishlist = (hotelId) => api.delete(`/user/wishlist/${hotelId}`);

export const getPaymentHistory = () => api.get('/user/payments/');
export const makePayment = (data) => api.post('/user/payments/', data);
