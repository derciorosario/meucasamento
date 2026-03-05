import axios from "axios";
const env = "pro";
///import { Capacitor, CapacitorHttp } from '@capacitor/core';
export const isNative = false /// Capacitor.isNativePlatform();


export const API_URL = 
  env == "dev" ? isNative ? "http://10.24.0.78:5000/api" : "http://localhost:5005/api" :
  env == "test" ? "https://kaziwani-server.visum.co.mz/api" :
                  "https://meucasamento-api.runwithbroto.com/api";


const client = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

const uploadClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "multipart/form-data" },
});

// TOKEN HELPERS
export function getStoredToken() {
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    null
  );
}

export function getStoredRefreshToken() {
  return localStorage.getItem("refresh_token") || null;
}

export function setStoredToken(token) {
  if (!token) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    delete client.defaults.headers.common.Authorization;
    return;
  }
  localStorage.setItem("accessToken", token);
  localStorage.setItem("token", token);
  client.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function setStoredRefreshToken(token) {
  if (!token) {
    localStorage.removeItem("refresh_token");
    return;
  }
  localStorage.setItem("refresh_token", token);
}

const bootToken = getStoredToken();
if (bootToken) {
  client.defaults.headers.common.Authorization = `Bearer ${bootToken}`;
}

// Queue for requests that need to wait for token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// AXIOS INTERCEPTORS - Request
client.interceptors.request.use((config) => {
  const t = getStoredToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

uploadClient.interceptors.request.use((config) => {
  const t = getStoredToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// AXIOS INTERCEPTORS - Response with automatic token refresh
client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    
    // If 401 and not already retried
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = getStoredRefreshToken();
      
      // No refresh token available, trigger logout
      if (!refreshToken) {
        setStoredToken(null);
        setStoredRefreshToken(null);
        window.dispatchEvent(new Event("auth:unauthorized"));
        return Promise.reject(err);
      }
      
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return client(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }
      
      // Start refresh process
      isRefreshing = true;
      
      try {
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken
        });
        
        const { accessToken } = response.data;
        
        // Update stored tokens
        setStoredToken(accessToken);
        
        // Update Authorization header for current request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Process queued requests
        processQueue(null, accessToken);
        
        // Retry original request
        return client(originalRequest);
      } catch (refreshError) {
        // Refresh failed, process queue with error
        processQueue(refreshError, null);
        
        // Clear tokens and trigger logout
        setStoredToken(null);
        setStoredRefreshToken(null);
        window.dispatchEvent(new Event("auth:unauthorized"));
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Handle 401 for other cases (no refresh token, invalid, etc.)
    if (err.response?.status === 401) {
      setStoredToken(null);
      setStoredRefreshToken(null);
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    
    return Promise.reject(err);
  }
);

uploadClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      setStoredToken(null);
      setStoredRefreshToken(null);
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    return Promise.reject(err);
  }
);

// ---- Capacitor Native Bridge ---- //
async function nativeRequest(method, url, data = null, headers = {}) {
  const response = await CapacitorHttp.request({
    url,
    method,
    headers,
    data,
  });

  return {
    status: response.status,
    data: response.data,
    headers: response.headers,
  };
}

if (isNative) {
  client.request = async function (config) {
    const token = getStoredToken();
    const headers = {
      ...(config.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    return nativeRequest(
      config.method.toUpperCase(),
      API_URL + config.url,
      config.data,
      headers
    );
  };

  uploadClient.request = async function (config) {

    const token = getStoredToken();
    const headers = {
      ...(config.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    return nativeRequest(
      config.method.toUpperCase(),
      API_URL + config.url,
      config.data,
      headers
    ); 

  };


}

export { uploadClient };
export default client;

// ==================== CATEGORIES API ====================

// Get all categories for the current user
export const getCategories = () => client.get('/categories');

// Get a single category by ID
export const getCategory = (id) => client.get(`/categories/${id}`);

// Create a new category
export const createCategory = (data) => client.post('/categories', data);

// Update a category
export const updateCategory = (id, data) => client.put(`/categories/${id}`, data);

// Delete a category
export const deleteCategory = (id) => client.delete(`/categories/${id}`);

// Initialize default categories for user
export const initDefaultCategories = () => client.post('/categories/init');

// ==================== BUDGET API ====================

// Get user's budget information
export const getBudget = () => client.get('/budget');

// Update user's budget information
export const updateBudget = (data) => client.put('/budget', data);

// ==================== TASKS API ====================
// Get all tasks for the authenticated user
export const getTasks = () => client.get('/tasks');

// Get tasks grouped by timeline
export const getTasksByTimeline = () => client.get('/tasks/timeline');

// Get tasks grouped by category
export const getTasksByCategory = () => client.get('/tasks/category');

// Initialize default tasks for a new user
export const initDefaultTasks = () => client.post('/tasks/init');

// Create a new task
export const createTask = (data) => client.post('/tasks', data);

// Update a task
export const updateTask = (taskId, data) => client.put(`/tasks/${taskId}`, data);

// Delete a task
export const deleteTask = (taskId) => client.delete(`/tasks/${taskId}`);

// Toggle task completion
export const toggleTaskCompletion = (taskId) => client.patch(`/tasks/${taskId}/toggle`);

// ==================== GUESTS API ====================

// Get all guests for the authenticated user
export const getGuests = (params) => client.get('/guests', { params });

// Get guest statistics
export const getGuestStats = () => client.get('/guests/stats');

// Create a new guest
export const createGuest = (data) => client.post('/guests', data);

// Import multiple guests
export const importGuests = (guests) => client.post('/guests/import', { guests });

// Update a guest
export const updateGuest = (id, data) => client.put(`/guests/${id}`, data);

// Delete a guest
export const deleteGuest = (id) => client.delete(`/guests/${id}`);

// Send invitation to a guest
export const sendGuestInvitation = (id) => client.post(`/guests/${id}/invite`);

// Send reminder to a guest
export const sendGuestReminder = (id) => client.post(`/guests/${id}/remind`);

// Send bulk invitations
export const sendBulkInvitations = (guestIds) => client.post('/guests/bulk-invite', { guestIds });

// Send invitation emails with confirmation links
export const sendInvitationEmails = (guestIds, customMessage) => client.post('/guests/send-invitations', { guestIds, customMessage });

// Confirm/decline invitation (public)
export const confirmInvitation = (token, response) => client.post('/guests/confirm', { token, response });

// Initialize default guest data
export const initGuestData = () => client.post('/guests/initialize');

// Groups API
export const getGroups = () => client.get('/guests/groups');
export const createGroup = (data) => client.post('/guests/groups', data);
export const updateGroup = (id, data) => client.put(`/guests/groups/${id}`, data);
export const deleteGroup = (id) => client.delete(`/guests/groups/${id}`);

// Tables API
export const getTables = () => client.get('/guests/tables');
export const createTable = (data) => client.post('/guests/tables', data);
export const updateTable = (id, data) => client.put(`/guests/tables/${id}`, data);
export const deleteTable = (id) => client.delete(`/guests/tables/${id}`);

// Menus API
export const getMenus = () => client.get('/guests/menus');
export const createMenu = (data) => client.post('/guests/menus', data);
export const updateMenu = (id, data) => client.put(`/guests/menus/${id}`, data);
export const deleteMenu = (id) => client.delete(`/guests/menus/${id}`);

// ==================== VENDORS API ====================

// Get all vendor categories
export const getVendorCategories = () => client.get('/vendors/categories');

// Get vendor's quote requests (for vendors)
export const getVendorQuoteRequests = () => client.get('/vendors/my/quotes');

// Request a quote from vendor
export const requestQuote = (vendorId, data) => client.post(`/vendors/${vendorId}/quote`, data);

// Update quote request status (accept/reject)
export const updateQuoteRequestStatus = (vendorId, quoteId, status, responseMessage) => 
  client.put(`/vendors/${vendorId}/quotes/${quoteId}`, { status, responseMessage });

// Get vendors with filtering
export const getVendors = (params) => client.get('/vendors', { params });

// Get single vendor by ID
export const getVendor = (id) => client.get(`/vendors/${id}`);

// Get featured vendors
export const getFeaturedVendors = () => client.get('/vendors/featured');

// Get vendors by category
export const getVendorsByCategory = (categorySlug) => client.get(`/vendors/featured/${categorySlug}`);

// Get available locations
export const getVendorLocations = () => client.get('/vendors/locations');

// Request quote from vendor
export const requestVendorQuote = (vendorId, data) => client.post(`/vendors/${vendorId}/quote`, data);

// Get user's quote requests
export const getMyQuoteRequests = () => client.get('/vendors/quotes/my');

// Add review to vendor
export const addVendorReview = (vendorId, data) => client.post(`/vendors/${vendorId}/reviews`, data);

// Update review
export const updateVendorReview = (vendorId, reviewId, data) => client.put(`/vendors/${vendorId}/reviews/${reviewId}`, data);

// Delete review
export const deleteVendorReview = (vendorId, reviewId) => client.delete(`/vendors/${vendorId}/reviews/${reviewId}`);

// Seed vendor data (development)
export const seedVendorData = () => client.post('/seed/vendors');

// ==================== PROFILE API ====================

// Get current user's profile
export const getProfile = () => client.get('/auth/profile');

// Get public user profile by userId
export const getUserProfileById = (userId) => client.get(`/auth/users/${userId}/profile`);

// Update current user's profile
export const updateProfile = (data) => client.put('/auth/profile', data);

// Settings API
export const getSettings = () => client.get('/settings');
export const updateSettings = (data) => client.put('/settings', data);
export const changePassword = (data) => client.put('/settings/password', data);
export const deleteAccount = (data) => client.delete('/settings/account', { data });

// Public Tutorials API
export const getTutorials = () => client.get('/settings/tutorials');

// Upload profile image
export const uploadProfileImage = (formData) => client.post('/upload/profile', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// ==================== GALLERY API ====================

// Get current user's albums
export const getMyAlbums = () => client.get('/gallery');

// Get single album
export const getAlbum = (id) => client.get(`/gallery/${id}`);

// Create new album
export const createAlbum = (data) => client.post('/gallery', data);

// Update album
export const updateAlbum = (id, data) => client.put(`/gallery/${id}`, data);

// Delete album
export const deleteAlbum = (id) => client.delete(`/gallery/${id}`);

// Upload photos with progress callback
export const uploadPhotos = (formData, onUploadProgress) => {
  return client.post('/gallery/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  });
};

// Delete photo
export const deletePhoto = (albumId, photoId) => client.delete(`/gallery/${albumId}/photos/${photoId}`);

// Update photo caption
export const updatePhotoCaption = (albumId, photoId, caption) => 
  client.put(`/gallery/${albumId}/photos/${photoId}`, { caption });

// Get shared album
export const getSharedAlbum = (shareCode) => client.get(`/gallery/shared/${shareCode}`);

// Upload photos to shared album (public)
export const uploadToSharedAlbum = (shareCode, formData, onUploadProgress) => {
  return client.post(`/gallery/shared/${shareCode}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  });
};

// Get all public galleries
export const getAllPublicGalleries = (params) => client.get('/gallery/public/all', { params });

// Get user public albums
export const getUserPublicAlbums = (userId) => client.get(`/gallery/user/${userId}`);

// ==================== ADMIN API ====================

// Get admin dashboard
export const getAdminDashboard = () => client.get('/admin/dashboard');

// Get all users with pagination
export const getAdminUsers = (params) => client.get('/admin/users', { params });

// Get single user by ID
export const getAdminUserById = (id) => client.get(`/admin/users/${id}`);

// Update user
export const updateAdminUser = (id, data) => client.put(`/admin/users/${id}`, data);

// Delete (deactivate) user
export const deleteAdminUser = (id) => client.delete(`/admin/users/${id}`);

// Reactivate user
export const reactivateAdminUser = (id) => client.post(`/admin/users/${id}/reactivate`);

// Get all vendors with pagination
export const getAdminVendors = (params) => client.get('/admin/vendors', { params });

// Update vendor
export const updateAdminVendor = (id, data) => client.put(`/admin/vendors/${id}`, data);

// Delete vendor
export const deleteAdminVendor = (id) => client.delete(`/admin/vendors/${id}`);

// Approve vendor
export const approveVendor = (id) => client.put(`/admin/vendors/${id}/approve`);

// Reject vendor
export const rejectVendor = (id, reason) => client.put(`/admin/vendors/${id}/reject`, { reason });

// Get all categories
export const getAdminCategories = () => client.get('/admin/categories');


// Create category
export const createAdminCategory = (data) => client.post('/admin/categories', data);

// Update category
export const updateAdminCategory = (id, data) => client.put(`/admin/categories/${id}`, data);

// Delete category
export const deleteAdminCategory = (id) => client.delete(`/admin/categories/${id}`);

// Get all galleries
export const getAdminGalleries = (params) => client.get('/admin/galleries', { params });

// Delete gallery
export const deleteAdminGallery = (id) => client.delete(`/admin/galleries/${id}`);

// Get admin settings
export const getAdminSettings = () => client.get('/admin/settings');

// Update admin settings
export const updateAdminSettings = (data) => client.put('/admin/settings', data);

// ==================== FAVORITES API ====================

// Get user's favorite vendors
export const getFavorites = () => client.get('/auth/favorites');

// Add a vendor to favorites
export const addFavorite = (vendorId) => client.post(`/auth/favorites/${vendorId}`);

// Remove a vendor from favorites
export const removeFavorite = (vendorId) => client.delete(`/auth/favorites/${vendorId}`);

// Get vendors by IDs (for favorites filter)
export const getVendorsByIds = (ids, params) => client.get('/vendors/by-ids', { params: { ids, ...params } });

// ==================== CONTACT API ====================

// Submit contact form
export const submitContactForm = (data) => client.post('/contact', data);

// ==================== CALENDAR API ====================

// Get all calendar events
export const getCalendarEvents = (params) => client.get('/calendar/events', { params });

// Get upcoming calendar events
export const getUpcomingCalendarEvents = () => client.get('/calendar/events/upcoming');

// Get single calendar event
export const getCalendarEvent = (id) => client.get(`/calendar/events/${id}`);

// Create new calendar event
export const createCalendarEvent = (data) => client.post('/calendar/events', data);

// Update calendar event
export const updateCalendarEvent = (id, data) => client.put(`/calendar/events/${id}`, data);

// Delete calendar event
export const deleteCalendarEvent = (id) => client.delete(`/calendar/events/${id}`);

// Share calendar event
export const shareCalendarEvent = (id, email, permission) => 
  client.post(`/calendar/events/${id}/share`, { email, permission });

// Remove share from calendar event
export const removeCalendarShare = (id, userId) => 
  client.delete(`/calendar/events/${id}/share/${userId}`);
