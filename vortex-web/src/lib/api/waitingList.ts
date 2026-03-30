import apiClient from './client';

export interface WaitingList {
  list_id: number;
  event_id: number;
  user_id: number;
  status: 'waiting' | 'notified' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface WaitingListResponse {
  success: boolean;
  data: WaitingList[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface WaitingListDetailResponse {
  success: boolean;
  data: WaitingList;
}

export const waitingListAPI = {
  // Get user's waiting lists
  getWaitingLists: async (page: number = 1, perPage: number = 15): Promise<WaitingListResponse> => {
    const response = await apiClient.get('/api/waiting-lists', {
      params: { page, per_page: perPage },
    });
    return response.data;
  },

  // Join event waiting list
  joinWaitingList: async (eventId: number): Promise<WaitingListDetailResponse> => {
    const response = await apiClient.post('/api/waiting-lists', { event_id: eventId });
    return response.data;
  },

  // Leave waiting list
  leaveWaitingList: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/api/waiting-lists/${id}`);
    return response.data;
  },

  // Get waiting list for specific event
  getEventWaitingList: async (eventId: number, page: number = 1): Promise<WaitingListResponse> => {
    const response = await apiClient.get(`/api/events/${eventId}/waiting-list`, {
      params: { page },
    });
    return response.data;
  },

  // Check if user is on waiting list
  checkWaitingListStatus: async (eventId: number): Promise<{ success: boolean; data: { is_waiting: boolean; position?: number } }> => {
    const response = await apiClient.get(`/api/waiting-lists/check/${eventId}`);
    return response.data;
  },

  // Notify user from waiting list (admin)
  notifyFromWaitingList: async (listId: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/api/waiting-lists/${listId}/notify`);
    return response.data;
  },
};
