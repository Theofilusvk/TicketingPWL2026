import apiClient from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export const authAPI = {
  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/login', credentials);
    return response.data;
  },

  // Register new user
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/api/auth/logout');
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<{ success: boolean; data: User }> => {
    const response = await apiClient.get('/api/user');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<{ success: boolean; data: User }> => {
    const response = await apiClient.patch('/api/user/profile', data);
    return response.data;
  },

  // Change password
  changePassword: async (current_password: string, new_password: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/api/user/password', {
      current_password,
      new_password,
      new_password_confirmation: new_password,
    });
    return response.data;
  },

  // Verify email
  verifyEmail: async (token: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/api/email/verify/${token}`);
    return response.data;
  },

  // Resend verification email
  resendVerificationEmail: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/api/email/resend');
    return response.data;
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/api/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/api/reset-password', {
      token,
      email,
      password,
      password_confirmation: password,
    });
    return response.data;
  },
};
