import apiClient from './client';

export interface Payment {
  payment_id: number;
  order_id: number;
  amount: number;
  payment_gateway: string;
  payment_date: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentRequest {
  order_id: number;
  amount: number;
  payment_gateway: 'stripe' | 'paypal' | 'bank_transfer' | 'credit_card';
}

export interface PaymentsResponse {
  success: boolean;
  data: Payment[];
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface PaymentDetailResponse {
  success: boolean;
  data: Payment;
}

export const paymentsAPI = {
  // Get user's payments
  getPayments: async (page: number = 1, perPage: number = 15): Promise<PaymentsResponse> => {
    const response = await apiClient.get('/api/payments', {
      params: { page, per_page: perPage },
    });
    return response.data;
  },

  // Get payment by ID
  getPaymentById: async (id: number): Promise<PaymentDetailResponse> => {
    const response = await apiClient.get(`/api/payments/${id}`);
    return response.data;
  },

  // Create payment
  createPayment: async (data: CreatePaymentRequest): Promise<PaymentDetailResponse> => {
    const response = await apiClient.post('/api/payments', data);
    return response.data;
  },

  // Update payment status
  updatePaymentStatus: async (id: number, status: string): Promise<PaymentDetailResponse> => {
    const response = await apiClient.patch(`/api/payments/${id}`, { status });
    return response.data;
  },

  // Get payment by order ID
  getPaymentByOrderId: async (orderId: number): Promise<PaymentDetailResponse> => {
    const response = await apiClient.get(`/api/orders/${orderId}/payment`);
    return response.data;
  },

  // Process payment (for payment gateway integration)
  processPayment: async (paymentId: number, gatewayData: any): Promise<{ success: boolean; message: string; redirect_url?: string }> => {
    const response = await apiClient.post(`/api/payments/${paymentId}/process`, gatewayData);
    return response.data;
  },

  // Verify payment (webhook from payment gateway)
  verifyPayment: async (transactionId: string): Promise<{ success: boolean; data: Payment }> => {
    const response = await apiClient.post('/api/payments/verify', { transaction_id: transactionId });
    return response.data;
  },

  // Refund payment
  refundPayment: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/api/payments/${id}/refund`);
    return response.data;
  },

  // Get payment statistics (admin)
  getPaymentStats: async (): Promise<{ success: boolean; data: any }> => {
    const response = await apiClient.get('/api/admin/payments/statistics');
    return response.data;
  },
};
