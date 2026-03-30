import apiClient from './client';

export interface Category {
  category_id?: number;
  id?: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface CategoryDetailResponse {
  success: boolean;
  data: Category;
}

export const categoriesAPI = {
  // Get all categories
  getCategories: async (page: number = 1, perPage: number = 50): Promise<CategoriesResponse> => {
    const response = await apiClient.get('/api/categories', {
      params: { page, per_page: perPage },
    });
    return response.data;
  },

  // Get category by ID
  getCategoryById: async (id: number): Promise<CategoryDetailResponse> => {
    const response = await apiClient.get(`/api/categories/${id}`);
    return response.data;
  },

  // Create category (admin)
  createCategory: async (data: Category): Promise<CategoryDetailResponse> => {
    const response = await apiClient.post('/api/categories', data);
    return response.data;
  },

  // Update category (admin)
  updateCategory: async (id: number, data: Partial<Category>): Promise<CategoryDetailResponse> => {
    const response = await apiClient.patch(`/api/categories/${id}`, data);
    return response.data;
  },

  // Delete category (admin)
  deleteCategory: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/api/categories/${id}`);
    return response.data;
  },
};
