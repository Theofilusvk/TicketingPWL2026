# Vortex-Web & PWL26 Integration Documentation

**Date**: March 30, 2026  
**Status**: Integration in Progress  
**Version**: 1.0

---

## Executive Summary

This document outlines the complete integration between the **vortex-web** React frontend and the **PWL26** Laravel backend. The vortex-web was built with UI components and placeholder data, but lacks backend connectivity. This integration connects the frontend to the RESTful API provided by PWL26.

---

## Current State Analysis

### Backend (PWL26)
✅ **Fully Implemented:**
- 8 RESTful resource controllers (Users, Events, Categories, Orders, OrderItems, Payments, Reports, WaitingLists)
- 10 database migrations with complete schema
- Laravel authentication (login, register, password reset)
- Profile management
- All necessary models with relationships

### Frontend (vortex-web)
✅ **Fully Implemented:**
- React component library (17 reusable components)
- 29 pages (21 user pages + 8 admin pages)
- Routing structure with React Router v7
- UI/styling with TailwindCSS
- Animations with Framer Motion & GSAP
- State management with Context API
- Internationalization (i18n)
- Audio synthesizer

❌ **Missing:**
- API client/service layer for backend communication
- Backend data integration
- Proper authentication flow
- Real data fetching from all endpoints

---

## Integration Gaps & Specifications

### 1. **Authentication System**
**Current State:** Frontend uses localStorage-based auth (mocked)  
**Required:** JWT or session-based auth with PWL26 backend

**Specifications:**
- Login endpoint: `POST /api/auth/login` (or `POST /login`)
- Register endpoint: `POST /api/auth/register` (or `POST /register`)
- Logout endpoint: `POST /api/auth/logout`
- Get current user: `GET /api/user`
- Update profile: `PATCH /api/user/profile`
- Refresh token: `POST /api/refresh` (if using JWT)

**Frontend Changes Needed:**
- Update `src/lib/auth.tsx` to use backend API
- Store JWT token or session in localStorage
- Add authorization headers to all API calls
- Implement token refresh mechanism

---

### 2. **Events Management**
**Current State:** EventsPage, EventDetailPage use placeholder data  
**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List all events |
| GET | `/api/events/{id}` | Get event details |
| POST | `/api/events` | Create event (admin only) |
| PATCH | `/api/events/{id}` | Update event (admin only) |
| DELETE | `/api/events/{id}` | Delete event (admin only) |

**Data Structure (Event):**
```json
{
  "event_id": 1,
  "name": "Concert 2026",
  "description": "...",
  "category_id": 1,
  "organizer_id": 1,
  "date": "2026-04-15T19:00:00Z",
  "location": "Stadium",
  "available_tickets": 500,
  "price": 100000,
  "thumbnailUrl": "...",
  "created_at": "...",
  "updated_at": "..."
}
```

**Frontend Changes:**
- Update EventsPage to fetch from `/api/events`
- Update EventDetailPage to fetch from `/api/events/{id}`
- Connect waiting list functionality

---

### 3. **Orders & Cart Management**
**Current State:** CartPage, CheckoutPage use local state only  
**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List user orders |
| GET | `/api/orders/{id}` | Get order details |
| POST | `/api/orders` | Create new order |
| PATCH | `/api/orders/{id}` | Update order status |
| GET | `/api/order-items` | List order items |
| POST | `/api/order-items` | Add item to order |

**Data Structure (Order):**
```json
{
  "order_id": 1,
  "user_id": 1,
  "event_id": 1,
  "status": "pending",
  "payment_method": "credit_card",
  "price": 500000,
  "order_items": [
    {
      "order_item_id": 1,
      "order_id": 1,
      "category_id": 1,
      "ticket_type": "VIP",
      "quantity": 2
    }
  ],
  "created_at": "...",
  "updated_at": "..."
}
```

**Frontend Changes:**
- Update `src/lib/store.tsx` to sync with `/api/orders`
- Implement checkout flow with order creation
- Add order history fetching in HistoryPage
- Connect cart operations to backend

---

### 4. **Payments**
**Current State:** SuccessPage shows mock data  
**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments` | List user payments |
| GET | `/api/payments/{id}` | Get payment details |
| POST | `/api/payments` | Create payment |
| PATCH | `/api/payments/{id}` | Update payment status |

**Data Structure (Payment):**
```json
{
  "payment_id": 1,
  "order_id": 1,
  "amount": 500000,
  "payment_gateway": "stripe",
  "payment_date": "2026-03-30T10:30:00Z",
  "status": "completed",
  "transaction_id": "txn_123456"
}
```

---

### 5. **Waiting List**
**Current State:** Not implemented in frontend  
**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/waiting-lists` | List user's waiting lists |
| POST | `/api/waiting-lists` | Join event waiting list |
| DELETE | `/api/waiting-lists/{id}` | Leave waiting list |

**Frontend Changes:**
- Add waiting list UI in EventDetailPage
- Implement join/leave waiting list

---

### 6. **User Management & Profile**
**Current State:** ProfilePage, SettingsPage use local state  
**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user` | Get current user |
| GET | `/api/users` | List users (admin) |
| GET | `/api/users/{id}` | Get user details |
| PATCH | `/api/user` | Update current user |
| POST | `/api/user/password` | Change password |

**Frontend Changes:**
- Fetch user data on app init
- Sync ProfilePage with backend
- Implement password change functionality

---

### 7. **Categories**
**Current State:** Not directly used in frontend  
**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| POST | `/api/categories` | Create category (admin) |
| PATCH | `/api/categories/{id}` | Update category (admin) |
| DELETE | `/api/categories/{id}` | Delete category (admin) |

---

### 8. **Reports**
**Current State:** ReportController exists but not used  
**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports` | List reports (admin) |
| GET | `/api/reports/{id}` | Get report details |
| POST | `/api/reports` | Create report |

---

### 9. **Admin Features**
**API Endpoints for Admin Dashboard:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/statistics` | Dashboard statistics |
| GET | `/api/admin/events` | Manage events |
| GET | `/api/admin/users` | Manage users |
| GET | `/api/admin/scanner` | QR code scanner (attendee check-in) |
| GET | `/api/admin/drops` | Manage merchandise drops |
| GET | `/api/admin/news` | Manage news/announcements |

---

## Required Changes & Implementation Plan

### Phase 1: Setup & Infrastructure (Priority: CRITICAL)
1. **Install dependencies:**
   ```bash
   npm install axios
   ```

2. **Create API client service:**
   - File: `src/lib/api/client.ts`
   - Setup axios instance with base URL pointing to PWL26
   - Add interceptors for auth headers
   - Add error handling

3. **Create API service modules:**
   - `src/lib/api/auth.ts` - Authentication endpoints
   - `src/lib/api/events.ts` - Events endpoints
   - `src/lib/api/orders.ts` - Orders/Cart endpoints
   - `src/lib/api/payments.ts` - Payments endpoints
   - `src/lib/api/users.ts` - User management endpoints
   - `src/lib/api/categories.ts` - Categories endpoints
   - `src/lib/api/waitingList.ts` - Waiting list endpoints
   - `src/lib/api/reports.ts` - Reports endpoints
   - `src/lib/api/admin.ts` - Admin endpoints

4. **Configure CORS in PWL26:**
   - Update Laravel middleware to allow vortex-web origin
   - File: `app/Http/Middleware/TrustHosts.php`
   - Add CORS headers configuration

5. **Environment configuration:**
   - Create `.env.local` in vortex-web with `VITE_API_BASE_URL`
   - Point to PWL26 backend URL

### Phase 2: Authentication Integration (Priority: CRITICAL)
1. **Update `src/lib/auth.tsx`:**
   - Integrate with `/api/auth/login`
   - Integrate with `/api/auth/register`
   - Implement token storage
   - Add automatic token refresh

2. **Update LoginPage & RegisterPage:**
   - Connect to backend auth
   - Add error handling
   - Add loading states

3. **Protect routes:**
   - Update `RequireAuth.tsx` to fetch user from backend
   - Validate token on app load

### Phase 3: Data Integration (Priority: HIGH)
1. **Update `src/lib/store.tsx`:**
   - Change from localStorage-based state to API-based
   - Implement data synchronization
   - Add loading/error states

2. **Update Pages:**
   - EventsPage → Fetch from `/api/events`
   - EventDetailPage → Fetch from `/api/events/{id}`
   - CartPage → Sync with `/api/orders`
   - CheckoutPage → Create order via API
   - HistoryPage → Fetch from `/api/orders`
   - ProfilePage → Fetch from `/api/user`
   - TicketsPage → Fetch user tickets

### Phase 4: Admin Integration (Priority: MEDIUM)
1. **Create admin API service:**
   - Statistics dashboard
   - Event management
   - User management
   - Scanner integration
   - News/drops management

2. **Update admin pages:**
   - Connect all admin components to backend

### Phase 5: Additional Features (Priority: LOW)
1. **Waiting List Integration**
2. **Category Management**
3. **Report Generation**
4. **News/Announcements**
5. **Merchandise Drops**

---

## Backend API Response Standards

### Success Response (200, 201)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* actual data */ }
}
```

### Error Response (4xx, 5xx)
```json
{
  "success": false,
  "message": "Error description",
  "errors": { /* field errors if validation */ }
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [ /* items */ ],
  "pagination": {
    "current_page": 1,
    "per_page": 15,
    "total": 100,
    "last_page": 7
  }
}
```

---

## Dependencies to Add

```json
{
  "axios": "^1.6.0"
}
```

---

## Environment Variables

**vortex-web/.env.local:**
```
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=10000
```

---

## Breaking Changes

1. **Authentication:** localStorage auth will be replaced with API-based sessions
2. **State Management:** LocalStorage-based cart will be replaced with server-side orders
3. **Data Fetching:** All pages will require API calls
4. **Env Variables:** New `VITE_API_BASE_URL` required

---

## Testing Checklist

- [ ] API client setup and axios configuration
- [ ] CORS configuration in Laravel
- [ ] Login/Register flows work
- [ ] Events listing and details load
- [ ] Cart and checkout functionality
- [ ] Order history displays
- [ ] Payment integration
- [ ] Admin dashboard functions
- [ ] User profile sync
- [ ] Waiting list operations
- [ ] All error states handled
- [ ] Loading states implemented

---

## Files to be Modified/Created

### New Files:
- `vortex-web/src/lib/api/client.ts`
- `vortex-web/src/lib/api/auth.ts`
- `vortex-web/src/lib/api/events.ts`
- `vortex-web/src/lib/api/orders.ts`
- `vortex-web/src/lib/api/payments.ts`
- `vortex-web/src/lib/api/users.ts`
- `vortex-web/src/lib/api/categories.ts`
- `vortex-web/src/lib/api/waitingList.ts`
- `vortex-web/src/lib/api/reports.ts`
- `vortex-web/src/lib/api/admin.ts`
- `vortex-web/.env.local`

### Modified Files:
- `vortex-web/src/lib/auth.tsx`
- `vortex-web/src/lib/store.tsx`
- `vortex-web/src/App.tsx`
- `vortex-web/src/pages/LoginPage.tsx`
- `vortex-web/src/pages/RegisterPage.tsx`
- `vortex-web/src/pages/EventsPage.tsx`
- `vortex-web/src/pages/EventDetailPage.tsx`
- `vortex-web/src/pages/CartPage.tsx`
- `vortex-web/src/pages/CheckoutPage.tsx`
- `vortex-web/src/pages/HistoryPage.tsx`
- `vortex-web/src/pages/ProfilePage.tsx`
- `vortex-web/src/pages/TicketsPage.tsx`
- `PWL26/app/Http/Middleware/TrustHosts.php` (CORS config)
- `vortex-web/package.json` (add axios)

---

## Summary of Changes

| Area | Change | Impact | Status |
|------|--------|--------|--------|
| **API Layer** | Create axios client & services | Backend connectivity | Planned |
| **Auth** | Replace localStorage with API | Real authentication | Planned |
| **Events** | Fetch from backend | Real event data | Planned |
| **Orders** | Replace local state with API | Real order management | Planned |
| **Payments** | Integrate with backend | Real payment tracking | Planned |
| **Admin** | Wire to backend endpoints | Admin functionality | Planned |
| **CORS** | Configure in Laravel | Allow frontend requests | Planned |
| **Env Config** | Add backend URL | Runtime configuration | Planned |

---

## Notes

- All dates use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
- All IDs are integers (event_id, user_id, etc.)
- Authentication uses Laravel's built-in session or JWT
- CORS will need to be configured to allow vortex-web domain
- Error responses should be consistent across all endpoints
- All monetary values in smallest currency unit (cents/rupiah)

