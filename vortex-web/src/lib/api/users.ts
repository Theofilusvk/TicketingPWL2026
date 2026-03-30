import apiClient from './client';

export interface AppUser {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface UsersResponse {
  success: boolean;
  data: AppUser[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface UserDetailResponse {
  success: boolean;
  data: AppUser;
}

export const usersAPI = {
  // Get all users (admin)
  getUsers: async (page: number = 1, perPage: number = 15): Promise<UsersResponse> => {
    const response = await apiClient.get('/api/users', {
      params: { page, per_page: perPage },
    });
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: number): Promise<UserDetailResponse> => {
    const response = await apiClient.get(`/api/users/${id}`);
    return response.data;
  },

  // Update user (admin)
  updateUser: async (id: number, data: Partial<AppUser>): Promise<UserDetailResponse> => {
    const response = await apiClient.patch(`/api/users/${id}`, data);
    return response.data;
  },

  // Delete user (admin)
  deleteUser: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/api/users/${id}`);
    return response.data;
  },

  // Get user statistics (admin)
  getUserStatistics: async (): Promise<{ success: boolean; data: any }> => {
    const response = await apiClient.get('/api/admin/users/statistics');
    return response.data;
  },

  // Search users
  searchUsers: async (query: string, page: number = 1): Promise<UsersResponse> => {
    const response = await apiClient.get('/api/users/search', {
      params: { q: query, page },
    });
    return response.data;
  },
};
