import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't redirect for login failures
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  signup: (data: any) => apiClient.post('/auth/signup', data),
  login: (data: any) => apiClient.post('/auth/login', data),
};

// Plants endpoints
export const plantsAPI = {
  getAll: (params?: { searchTerm?: string; page?: number; limit?: number; sortBy?: string; sortOrder?: string }) => {
    const token = localStorage.getItem('token');
    return apiClient.get('/plants', {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  getById: (id: string) => apiClient.get(`/plants/${id}`),
  create: (data: FormData) => {
    const token = localStorage.getItem('token');
    return apiClient.post('/plants', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
  },
  update: (id: string, data: FormData) => {
    const token = localStorage.getItem('token');
    return apiClient.put(`/plants/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
  },
  delete: (id: string) => apiClient.delete(`/plants/${id}`),
  analyzeImage: (id: string, data: { force: boolean }) => apiClient.post(`/plants/${id}/ai-recommendations`, data),
  getCareTips: (id: string, data: { logs?: string[] }) => apiClient.post(`/plants/${id}/care-tips`, data),
};

// Logs endpoints
export const logsAPI = {
  addLogs: (plantId: string, data: any) => apiClient.post(`/plants/${plantId}/logs`, data),
  updateLog: (logId: string, data: any) => apiClient.put(`/plants/logs/${logId}`, data),
  deleteLog: (logId: string) => apiClient.delete(`/plants/logs/${logId}`),
};

// User/Profile endpoints
export const userAPI = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data: { name?: string; email?: string }) => apiClient.put('/users/profile', data),
  uploadProfileImage: (formData: FormData) => {
    const token = localStorage.getItem('token');
    return apiClient.post('/users/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
  },
  deleteProfileImage: () => apiClient.delete('/users/profile/image'),
};

export default apiClient;
