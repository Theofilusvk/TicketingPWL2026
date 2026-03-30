import apiClient from './client';

export interface Event {
  event_id?: number;
  id?: number;
  name: string;
  description: string;
  category_id: number;
  organizer_id?: number;
  date: string;
  location: string;
  available_tickets: number;
  price: number;
  thumbnail_url?: string;
  thumbnailUrl?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEventRequest {
  name: string;
  description: string;
  category_id: number;
  date: string;
  location: string;
  available_tickets: number;
  price: number;
  thumbnail_url?: string;
}

export interface EventsResponse {
  success: boolean;
  data: Event[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface EventDetailResponse {
  success: boolean;
  data: Event;
}

export const eventsAPI = {
  // Get all events with pagination
  getEvents: async (page: number = 1, perPage: number = 15): Promise<EventsResponse> => {
    const response = await apiClient.get('/api/events', {
      params: { page, per_page: perPage },
    });
    return response.data;
  },

  // Get event by ID
  getEventById: async (id: number): Promise<EventDetailResponse> => {
    const response = await apiClient.get(`/api/events/${id}`);
    return response.data;
  },

  // Create event (admin)
  createEvent: async (data: CreateEventRequest): Promise<EventDetailResponse> => {
    const response = await apiClient.post('/api/events', data);
    return response.data;
  },

  // Update event (admin)
  updateEvent: async (id: number, data: Partial<CreateEventRequest>): Promise<EventDetailResponse> => {
    const response = await apiClient.patch(`/api/events/${id}`, data);
    return response.data;
  },

  // Delete event (admin)
  deleteEvent: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/api/events/${id}`);
    return response.data;
  },

  // Search events
  searchEvents: async (query: string): Promise<EventsResponse> => {
    const response = await apiClient.get('/api/events/search', {
      params: { q: query },
    });
    return response.data;
  },

  // Filter events by category
  filterByCategory: async (categoryId: number, page: number = 1): Promise<EventsResponse> => {
    const response = await apiClient.get('/api/events', {
      params: { category_id: categoryId, page },
    });
    return response.data;
  },

  // Get upcoming events
  getUpcomingEvents: async (limit: number = 10): Promise<EventsResponse> => {
    const response = await apiClient.get('/api/events/upcoming', {
      params: { limit },
    });
    return response.data;
  },
};
