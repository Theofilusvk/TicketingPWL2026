import apiClient from './client';

export interface Report {
  report_id: number;
  event_id: number;
  title?: string;
  content?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReportRequest {
  event_id: number;
  title?: string;
  content?: string;
}

export interface ReportsResponse {
  success: boolean;
  data: Report[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface ReportDetailResponse {
  success: boolean;
  data: Report;
}

export const reportsAPI = {
  // Get all reports (admin)
  getReports: async (page: number = 1, perPage: number = 15): Promise<ReportsResponse> => {
    const response = await apiClient.get('/api/reports', {
      params: { page, per_page: perPage },
    });
    return response.data;
  },

  // Get report by ID
  getReportById: async (id: number): Promise<ReportDetailResponse> => {
    const response = await apiClient.get(`/api/reports/${id}`);
    return response.data;
  },

  // Create report
  createReport: async (data: CreateReportRequest): Promise<ReportDetailResponse> => {
    const response = await apiClient.post('/api/reports', data);
    return response.data;
  },

  // Update report (admin)
  updateReport: async (id: number, data: Partial<CreateReportRequest>): Promise<ReportDetailResponse> => {
    const response = await apiClient.patch(`/api/reports/${id}`, data);
    return response.data;
  },

  // Delete report (admin)
  deleteReport: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/api/reports/${id}`);
    return response.data;
  },

  // Get reports for specific event
  getEventReports: async (eventId: number, page: number = 1): Promise<ReportsResponse> => {
    const response = await apiClient.get(`/api/events/${eventId}/reports`, {
      params: { page },
    });
    return response.data;
  },
};
