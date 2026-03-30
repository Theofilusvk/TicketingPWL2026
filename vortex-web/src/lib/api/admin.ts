import apiClient from './client';

export interface DashboardStatistics {
  total_users: number;
  total_events: number;
  total_orders: number;
  total_revenue: number;
  pending_payments: number;
  upcoming_events: number;
}

export interface Venue {
  venue_id?: number;
  id?: number;
  name: string;
  location: string;
  capacity: number;
  created_at?: string;
  updated_at?: string;
}

export interface Drop {
  drop_id: number;
  name: string;
  description?: string;
  image_url?: string;
  price: number;
  quantity: number;
  available: number;
  created_at: string;
  updated_at: string;
}

export interface News {
  news_id?: number;
  id?: number;
  title: string;
  content: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export const adminAPI = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<{ success: boolean; data: DashboardStatistics }> => {
    const response = await apiClient.get('/api/admin/dashboard');
    return response.data;
  },

  // Venues
  venues: {
    getAll: async (page: number = 1): Promise<{ success: boolean; data: Venue[] }> => {
      const response = await apiClient.get('/api/admin/venues', { params: { page } });
      return response.data;
    },
    create: async (data: Venue): Promise<{ success: boolean; data: Venue }> => {
      const response = await apiClient.post('/api/admin/venues', data);
      return response.data;
    },
    update: async (id: number, data: Partial<Venue>): Promise<{ success: boolean; data: Venue }> => {
      const response = await apiClient.patch(`/api/admin/venues/${id}`, data);
      return response.data;
    },
    delete: async (id: number): Promise<{ success: boolean; message: string }> => {
      const response = await apiClient.delete(`/api/admin/venues/${id}`);
      return response.data;
    },
  },

  // Drops (Merchandise)
  drops: {
    getAll: async (page: number = 1): Promise<{ success: boolean; data: Drop[] }> => {
      const response = await apiClient.get('/api/admin/drops', { params: { page } });
      return response.data;
    },
    create: async (data: Drop): Promise<{ success: boolean; data: Drop }> => {
      const response = await apiClient.post('/api/admin/drops', data);
      return response.data;
    },
    update: async (id: number, data: Partial<Drop>): Promise<{ success: boolean; data: Drop }> => {
      const response = await apiClient.patch(`/api/admin/drops/${id}`, data);
      return response.data;
    },
    delete: async (id: number): Promise<{ success: boolean; message: string }> => {
      const response = await apiClient.delete(`/api/admin/drops/${id}`);
      return response.data;
    },
  },

  // News/Announcements
  news: {
    getAll: async (page: number = 1): Promise<{ success: boolean; data: News[] }> => {
      const response = await apiClient.get('/api/admin/news', { params: { page } });
      return response.data;
    },
    create: async (data: News): Promise<{ success: boolean; data: News }> => {
      const response = await apiClient.post('/api/admin/news', data);
      return response.data;
    },
    update: async (id: number, data: Partial<News>): Promise<{ success: boolean; data: News }> => {
      const response = await apiClient.patch(`/api/admin/news/${id}`, data);
      return response.data;
    },
    delete: async (id: number): Promise<{ success: boolean; message: string }> => {
      const response = await apiClient.delete(`/api/admin/news/${id}`);
      return response.data;
    },
  },

  // QR Code Scanner (check-in attendees)
  scanner: {
    validateQRCode: async (qrCode: string): Promise<{ success: boolean; data: any }> => {
      const response = await apiClient.post('/api/admin/scanner/validate', { qr_code: qrCode });
      return response.data;
    },
    checkInAttendee: async (qrCode: string): Promise<{ success: boolean; message: string; data: any }> => {
      const response = await apiClient.post('/api/admin/scanner/check-in', { qr_code: qrCode });
      return response.data;
    },
    getScanHistory: async (eventId: number, page: number = 1): Promise<{ success: boolean; data: any[] }> => {
      const response = await apiClient.get(`/api/admin/events/${eventId}/scan-history`, { params: { page } });
      return response.data;
    },
  },

  // Analytics
  getEventAnalytics: async (eventId: number): Promise<{ success: boolean; data: any }> => {
    const response = await apiClient.get(`/api/admin/events/${eventId}/analytics`);
    return response.data;
  },

  // Export reports
  exportEventReport: async (eventId: number, format: 'csv' | 'pdf' = 'csv'): Promise<Blob> => {
    const response = await apiClient.get(`/api/admin/events/${eventId}/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },
};
