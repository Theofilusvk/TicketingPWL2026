import apiClient from './client';

export interface OrderItem {
  order_item_id: number;
  order_id: number;
  category_id: number;
  ticket_type: string;
  quantity: number;
  price?: number;
}

export interface Order {
  order_id: number;
  user_id: number;
  event_id: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_method: string;
  price: number;
  order_items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrderRequest {
  event_id: number;
  items: {
    category_id: number;
    ticket_type: string;
    quantity: number;
  }[];
  payment_method: string;
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface OrderDetailResponse {
  success: boolean;
  data: Order;
}

export const ordersAPI = {
  // Get user's orders
  getOrders: async (page: number = 1, perPage: number = 15): Promise<OrdersResponse> => {
    const response = await apiClient.get('/api/orders', {
      params: { page, per_page: perPage },
    });
    return response.data;
  },

  // Get order by ID
  getOrderById: async (id: number): Promise<OrderDetailResponse> => {
    const response = await apiClient.get(`/api/orders/${id}`);
    return response.data;
  },

  // Create new order
  createOrder: async (data: CreateOrderRequest): Promise<OrderDetailResponse> => {
    const response = await apiClient.post('/api/orders', data);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (id: number, status: string): Promise<OrderDetailResponse> => {
    const response = await apiClient.patch(`/api/orders/${id}`, { status });
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/api/orders/${id}/cancel`);
    return response.data;
  },

  // Get order history
  getOrderHistory: async (page: number = 1): Promise<OrdersResponse> => {
    const response = await apiClient.get('/api/orders/history', {
      params: { page },
    });
    return response.data;
  },

  // Get pending orders
  getPendingOrders: async (): Promise<OrdersResponse> => {
    const response = await apiClient.get('/api/orders?status=pending');
    return response.data;
  },
};

export const orderItemsAPI = {
  // Get all order items
  getOrderItems: async (page: number = 1): Promise<{ success: boolean; data: OrderItem[] }> => {
    const response = await apiClient.get('/api/order-items', {
      params: { page },
    });
    return response.data;
  },

  // Get order items for specific order
  getOrderItemsByOrderId: async (orderId: number): Promise<{ success: boolean; data: OrderItem[] }> => {
    const response = await apiClient.get(`/api/orders/${orderId}/items`);
    return response.data;
  },

  // Create order item
  createOrderItem: async (orderId: number, data: Omit<OrderItem, 'order_item_id' | 'order_id'>): Promise<{ success: boolean; data: OrderItem }> => {
    const response = await apiClient.post(`/api/orders/${orderId}/items`, data);
    return response.data;
  },

  // Update order item
  updateOrderItem: async (orderId: number, itemId: number, data: Partial<OrderItem>): Promise<{ success: boolean; data: OrderItem }> => {
    const response = await apiClient.patch(`/api/orders/${orderId}/items/${itemId}`, data);
    return response.data;
  },

  // Delete order item
  deleteOrderItem: async (orderId: number, itemId: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/api/orders/${orderId}/items/${itemId}`);
    return response.data;
  },
};
