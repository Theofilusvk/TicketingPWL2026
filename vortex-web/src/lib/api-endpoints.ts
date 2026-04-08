import { apiClient } from './api'

// ============ AUTH ENDPOINTS ============
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  register: (email: string, password: string, password_confirmation: string, name: string) =>
    apiClient.post('/auth/register', {
      email,
      password,
      password_confirmation,
      name,
    }),

  logout: () => apiClient.post('/auth/logout', {}),

  refreshToken: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refresh_token: refreshToken }),

  getCurrentUser: () => apiClient.get('/user'),

  updateProfile: (data: { name?: string; email?: string; bio?: string; avatar?: string }) =>
    apiClient.put('/profile', data),

  changePassword: (currentPassword: string, newPassword: string, newPasswordConfirmation: string) =>
    apiClient.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation,
    }),
}

// ============ EVENTS ENDPOINTS ============
export const eventsAPI = {
  list: (page = 1, perPage = 15, filters?: { category_id?: number; status?: string }) =>
    apiClient.get('/events', { params: { page, per_page: perPage, ...filters } }),

  get: (id: number | string) => apiClient.get(`/events/${id}`),

  create: (data: {
    title: string
    description: string
    category_id: number
    location: string
    start_time: string
    end_time: string
    status: string
    banner?: File
    ticket_types: Array<{ name: string; price: number; available_stock: number }>
  }) => {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description)
    formData.append('category_id', data.category_id.toString())
    formData.append('location', data.location)
    formData.append('start_time', data.start_time)
    formData.append('end_time', data.end_time)
    formData.append('status', data.status)
    if (data.banner) {
      formData.append('banner', data.banner)
    }
    formData.append('ticket_types', JSON.stringify(data.ticket_types))

    return apiClient.postFormData('/events', formData)
  },

  update: (id: number | string, data: Partial<any>) =>
    apiClient.put(`/events/${id}`, data),

  delete: (id: number | string) => apiClient.delete(`/events/${id}`),
}

// ============ CATEGORIES ENDPOINTS ============
export const categoriesAPI = {
  list: () => apiClient.get('/categories'),

  get: (id: number | string) => apiClient.get(`/categories/${id}`),

  create: (data: { name: string; description: string }) =>
    apiClient.post('/categories', data),

  update: (id: number | string, data: { name?: string; description?: string }) =>
    apiClient.put(`/categories/${id}`, data),

  delete: (id: number | string) => apiClient.delete(`/categories/${id}`),
}

// ============ ORDERS ENDPOINTS ============
export const ordersAPI = {
  list: (page = 1, perPage = 10) =>
    apiClient.get('/orders', { params: { page, per_page: perPage } }),

  get: (id: number | string) => apiClient.get(`/orders/${id}`),

  create: (data: { event_id: number; items: Array<{ ticket_type_id: number; quantity: number }> }) =>
    apiClient.post('/orders', data),

  update: (id: number | string, data: Partial<any>) =>
    apiClient.put(`/orders/${id}`, data),

  cancel: (id: number | string) => apiClient.post(`/orders/${id}/cancel`, {}),

  getUserOrders: () => apiClient.get('/orders'),
}

// ============ TICKETS ENDPOINTS ============
export const ticketsAPI = {
  generate: (orderItemId: number, quantity: number) =>
    apiClient.post('/tickets/generate', {
      order_item_id: orderItemId,
      quantity,
    }),

  validate: (ticketCode: string) =>
    apiClient.post('/tickets/validate', { ticket_code: ticketCode }),

  checkIn: (ticketCode: string) =>
    apiClient.post(`/tickets/${ticketCode}/check-in`, {}),

  getTicketsByOrder: (orderId: number | string) =>
    apiClient.get(`/orders/${orderId}/tickets`),
}

// ============ PAYMENTS ENDPOINTS ============
export const paymentsAPI = {
  list: (page = 1, perPage = 10) =>
    apiClient.get('/payments', { params: { page, per_page: perPage } }),

  get: (id: number | string) => apiClient.get(`/payments/${id}`),

  create: (data: { order_id: number; payment_gateway: string; amount: number }) =>
    apiClient.post('/payments', data),

  verify: (id: number | string) => apiClient.post(`/payments/${id}/verify`, {}),

  getByOrder: (orderId: number | string) =>
    apiClient.get(`/orders/${orderId}/payments`),
}

// ============ WAITING LIST ENDPOINTS ============
export const waitingListAPI = {
  join: (eventId: number, ticketTypeId: number) =>
    apiClient.post('/waiting-list/join', {
      event_id: eventId,
      ticket_type_id: ticketTypeId,
    }),

  leave: (eventId: number, ticketTypeId: number) =>
    apiClient.post('/waiting-list/leave', {
      event_id: eventId,
      ticket_type_id: ticketTypeId,
    }),

  getStatus: (eventId: number, ticketTypeId: number) =>
    apiClient.get('/waiting-list/status', {
      params: {
        event_id: eventId,
        ticket_type_id: ticketTypeId,
      },
    }),

  getUserWaitingLists: () => apiClient.get('/waiting-list/user'),
}

// ============ REPORTS ENDPOINTS ============
export const reportsAPI = {
  list: (page = 1, perPage = 10) =>
    apiClient.get('/reports', { params: { page, per_page: perPage } }),

  get: (id: number | string) => apiClient.get(`/reports/${id}`),

  generate: (eventId: number, fileType: 'excel' | 'pdf') =>
    apiClient.post('/reports/generate', {
      event_id: eventId,
      file_type: fileType,
    }),

  delete: (id: number | string) => apiClient.delete(`/reports/${id}`),
}

// ============ DASHBOARD ENDPOINTS ============
export const dashboardAPI = {
  getStats: () => apiClient.get('/dashboard/stats'),

  getEventStats: (eventId: number | string) =>
    apiClient.get(`/dashboard/events/${eventId}/stats`),

  getUserStats: () => apiClient.get('/dashboard/user-stats'),
}
