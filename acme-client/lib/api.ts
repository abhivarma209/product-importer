import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const productsApi = {
  getAll: (params: any) => api.get('/api/products', { params }),
  getById: (id: number) => api.get(`/api/products/${id}`),
  create: (data: any) => api.post('/api/products', data),
  update: (id: number, data: any) => api.put(`/api/products/${id}`, data),
  delete: (id: number) => api.delete(`/api/products/${id}`),
  bulkDelete: () => api.delete('/api/products'),
  exportToExcel: (params: any) => api.get('/api/products/export/excel', { 
    params,
    responseType: 'blob'
  }),
};

// Upload API
export const uploadApi = {
  uploadCsv: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getStatus: (taskId: string) => api.get(`/api/upload/status/${taskId}`),
};

// Webhooks API
export const webhooksApi = {
  getAll: () => api.get('/api/webhooks'),
  create: (data: any) => api.post('/api/webhooks', data),
  update: (id: number, data: any) => api.put(`/api/webhooks/${id}`, data),
  delete: (id: number) => api.delete(`/api/webhooks/${id}`),
  test: (id: number) => api.post(`/api/webhooks/${id}/test`),
};

export default api;

