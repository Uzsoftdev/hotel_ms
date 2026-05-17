import api from './api';

// Hotels
export const getHotels = () => api.get('/admin/hotels/');
export const createHotel = (data) => api.post('/admin/hotels/', data);
export const updateHotel = (id, data) => api.put(`/admin/hotels/${id}`, data);
export const deleteHotel = (id) => api.delete(`/admin/hotels/${id}`);

// Bookings
export const getAllBookings = (status) =>
  api.get('/admin/bookings/', { params: status ? { status } : {} });
export const checkInGuest = (id) => api.put(`/admin/bookings/${id}/checkin`);
export const checkOutGuest = (id) => api.put(`/admin/bookings/${id}/checkout`);
export const updateBookingStatus = (id, status) =>
  api.put(`/admin/bookings/${id}/status`, null, { params: { new_status: status } });

// Pricing
export const getPricingRules = () => api.get('/admin/pricing-rules/');
export const createPricingRule = (data) => api.post('/admin/pricing-rules/', data);
export const deletePricingRule = (id) => api.delete(`/admin/pricing-rules/${id}`);

// Blackout dates
export const getBlackoutDates = () => api.get('/admin/blackout-dates/');
export const createBlackoutDate = (data) => api.post('/admin/blackout-dates/', data);
export const deleteBlackoutDate = (id) => api.delete(`/admin/blackout-dates/${id}`);

// Users
export const getUsers = (role) => api.get('/admin/users/', { params: role ? { role } : {} });
export const createUser = (data) => api.post('/admin/users/', data);
export const updateUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const banUser = (id, ban, reason) => api.patch(`/admin/users/${id}/ban`, { ban, reason });
export const toggleVip = (id) => api.patch(`/admin/users/${id}/vip`);
export const updateLoyalty = (id, points_delta, tier) => api.patch(`/admin/users/${id}/loyalty`, { points_delta, tier });
export const getUserDetail = (id) => api.get(`/admin/users/${id}/detail`);

// Reports
export const getOccupancyReport = (days) => api.get('/admin/reports/occupancy', { params: { days } });
export const getRevenueReport = (days) => api.get('/admin/reports/revenue', { params: { days } });
export const getGuestAnalytics = (days) => api.get('/admin/reports/guests', { params: { days } });
export const getActivityLogs = (limit) => api.get('/admin/reports/activity-logs', { params: { limit } });
export const exportReport = (reportType, days) => api.get(`/admin/reports/export/${reportType}`, { params: { days }, responseType: 'text' });

// System
export const getSystemHealth = () => api.get('/admin/system/health');

// AI
export const getAIInsights = () => api.get('/admin/ai/insights');

// Public AI (used by frontend components)
export const aiChat = (message, history = []) => api.post('/public/ai/chat', { message, history });
export const aiRecommend = (prefs) => api.post('/public/ai/recommend', prefs);
