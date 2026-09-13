import axios from 'axios';
import type { Activity, ActivityCreate } from '../types/activity';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userName');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const activityApi = {
  getAll: async () => {
    const response = await api.get<Activity[]>('/activities/');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get<Activity>(`/activities/${id}`);
    return response.data;
  },
  create: async (data: ActivityCreate) => {
    const response = await api.post<Activity>('/activities/', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Activity>) => {
    const response = await api.put<Activity>(`/activities/${id}`, data);
    return response.data;
  },
};

export const participantApi = {
  list: async (params?: Record<string, any>) => {
    const response = await api.get('/participants/', { params });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/participants/${id}`);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/participants/${id}`, data);
    return response.data;
  },
  verifyWhatsApp: async (id: number, data: { verified: boolean; note?: string }) => {
    const response = await api.put(`/participants/${id}/verify-whatsapp`, data);
    return response.data;
  },
  updateFinalStatus: async (id: number, final_status: string) => {
    const response = await api.put(`/participants/${id}/final-status`, { final_status });
    return response.data;
  },
};

export const dashboardApi = {
  getStats: async (activityId: number) => {
    const response = await api.get(`/dashboard/stats/${activityId}`);
    return response.data;
  },
  getInterviewStats: async (activityId: number) => {
    const response = await api.get(`/dashboard/interview/${activityId}`);
    return response.data;
  },
};

export const interviewApi = {
  get: async (participantId: number) => {
    const response = await api.get(`/interviews/${participantId}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/interviews/', data);
    return response.data;
  },
  update: async (participantId: number, data: any) => {
    const response = await api.put(`/interviews/${participantId}`, data);
    return response.data;
  },
  lock: async (participantId: number) => {
    const response = await api.post(`/interviews/lock/${participantId}`);
    return response.data;
  },
  unlock: async (participantId: number) => {
    const response = await api.delete(`/interviews/lock/${participantId}`);
    return response.data;
  },
};

export const mastersApi = {
  // Colleges
  getColleges: async () => (await api.get('/masters/colleges')).data,
  createCollege: async (name: string) => (await api.post('/masters/colleges', { name })).data,
  updateCollege: async (id: number, data: any) => (await api.put(`/masters/colleges/${id}`, data)).data,

  // Streams
  getStreams: async () => (await api.get('/masters/streams')).data,
  createStream: async (name: string) => (await api.post('/masters/streams', { name })).data,
  updateStream: async (id: number, data: any) => (await api.put(`/masters/streams/${id}`, data)).data,

  // Years
  getYears: async () => (await api.get('/masters/years')).data,
  createYear: async (name: string) => (await api.post('/masters/years', { name })).data,
  updateYear: async (id: number, data: any) => (await api.put(`/masters/years/${id}`, data)).data,

  // Users
  getUsers: async () => (await api.get('/masters/users')).data,
  createUser: async (data: any) => (await api.post('/masters/users', data)).data,
  updateUser: async (id: number, data: any) => (await api.put(`/masters/users/${id}`, data)).data,
};

export default api;
