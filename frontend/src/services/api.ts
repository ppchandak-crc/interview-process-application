import axios from 'axios';
import type { Activity, ActivityCreate } from '../types/activity';

const API_URL = 'http://localhost:8000';

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

export default api;
