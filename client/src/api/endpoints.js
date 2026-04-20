import { api } from './client.js';

export const authApi = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  changePassword: (data) => api.post('/auth/change-password', data).then((r) => r.data),
};

export const profileApi = {
  get: () => api.get('/profile').then((r) => r.data.profile),
  update: (data) => api.put('/profile', data).then((r) => r.data.profile),
};

export const projectsApi = {
  list: (params) => api.get('/projects', { params }).then((r) => r.data.items),
  get: (slug) => api.get(`/projects/${slug}`).then((r) => r.data.project),
  create: (data) => api.post('/projects', data).then((r) => r.data.project),
  update: (id, data) => api.put(`/projects/${id}`, data).then((r) => r.data.project),
  remove: (id) => api.delete(`/projects/${id}`).then((r) => r.data),
};

export const postsApi = {
  list: (params) => api.get('/posts', { params }).then((r) => r.data.items),
  get: (slug) => api.get(`/posts/${slug}`).then((r) => r.data.post),
  create: (data) => api.post('/posts', data).then((r) => r.data.post),
  update: (id, data) => api.put(`/posts/${id}`, data).then((r) => r.data.post),
  remove: (id) => api.delete(`/posts/${id}`).then((r) => r.data),
};

export const messagesApi = {
  send: (data) => api.post('/messages', data).then((r) => r.data),
  list: () => api.get('/messages').then((r) => r.data.items),
  markRead: (id) => api.patch(`/messages/${id}/read`).then((r) => r.data.message),
  remove: (id) => api.delete(`/messages/${id}`).then((r) => r.data),
};
