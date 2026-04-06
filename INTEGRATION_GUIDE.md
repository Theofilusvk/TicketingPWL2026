# Frontend-Backend Integration Guide

## 🎯 Implementation Summary

The React frontend (vortex-web) has been successfully integrated with the Laravel backend (PWL26) to work together seamlessly. All changes are backward-compatible, and the frontend gracefully falls back to default data if the backend is unavailable.

---

## ✅ What Was Implemented

### **Phase 1 & 2: Infrastructure & API Client Layer** ✓

#### 1. **Environment Configuration**
- **`.env.local`** - Development environment variables
  ```
  VITE_API_URL=http://localhost:8000/api
  VITE_APP_URL=http://localhost:8000
  VITE_GEMINI_API_KEY=your-key
  ```
- **`.env.production`** - Production environment variables (customize before deploy)
- **`vite.config.ts`** - Updated with environment variable support and proxy configuration

#### 2. **API Client** (`src/lib/api.ts`)
- Centralized Axios instance for all API requests
- **Request interceptor**: Automatically adds JWT token to all requests
- **Response interceptor**: 
  - Handles 401 errors with automatic token refresh
  - Redirects to login on auth failure
  - Graceful error handling
- **Token management**: Stores and retrieves JWT tokens from localStorage
- **Support for file uploads** via `postFormData()` method

#### 3. **API Endpoints Module** (`src/lib/api-endpoints.ts`)
Organized endpoints by resource:
- `authAPI` - Login, register, logout, profile management
- `eventsAPI` - List, get, create, update, delete events
- `categoriesAPI` - Manage event categories
- `ordersAPI` - Create and manage orders
- `ticketsAPI` - Generate and validate tickets
- `paymentsAPI` - Process payments
- `waitingListAPI` - Manage waiting lists
- `reportsAPI` - Generate reports
- `dashboardAPI` - Get analytics and stats

### **Phase 3: Authentication Integration** ✓

#### 4. **Auth Service** (`src/services/authService.ts`)
- **Backend-connected authentication** replacing localStorage-only auth
- Methods:
  - `login(email, password)` - Authenticate with backend
  - `register(name, email, password, passwordConfirmation)` - Create account
  - `logout()` - Clear auth and logout from backend
  - `getCurrentUser()` - Fetch authenticated user from API
  - `updateProfile(updates)` - Update user profile
  - `changePassword()` - Change password securely
  - `isAuthenticated()` - Check if user has valid token
- **Token caching** for offline support
- **Type-safe** with TypeScript interfaces

#### 5. **Updated Auth Context** (`src/lib/auth.tsx`)
- **Async authentication**: All login/signup/logout operations are now async
- **Loading states**: `isLoading` flag for UI feedback during auth operations
- **Bridged user types**: Converts between frontend `User` type and backend `AuthUser` type
- **Backward compatible**: Still works with existing components via `useAuth()` hook
- **Auto-initialization**: Loads current user on app startup

**Key Changes**:
```typescript
// Old (localStorage-only)
const { login } = useAuth();
login({ username: 'john', password: 'pass' });

// New (API-connected)
const { login, isLoading } = useAuth();
const result = await login({ email: 'john@example.com', password: 'pass' });
```

### **Phase 4: Data Layer Integration** ✓

#### 6. **Updated Store** (`src/lib/store.tsx`)
- **Real-time event loading**: Events fetch from API on app startup
- **Fallback mechanism**: Uses default hardcoded events if API is unavailable
- **Data conversion**: Automatically converts backend event format to frontend format
- **Reload capability**: `reloadEvents()` method to refresh events from API
- **Loading state**: `eventsLoading` flag for UI feedback
- **Preserved functionality**: All cart, checkout, and credit logic remains unchanged
- **Type compatibility**: Works with both string and numeric IDs from backend

**Key Features**:
```typescript
const { events, eventsLoading, reloadEvents } = useStore();

// Manual refresh
await reloadEvents();

// Backend events automatically loaded on mount
```

---

## 🚀 How to Use

### **Starting the Backend**
```bash
cd PWL26
php artisan serve
# Backend runs at http://localhost:8000
```

### **Starting the Frontend**
```bash
cd vortex-web
npm run dev
# Frontend runs at http://localhost:5173
```

### **API Communication Flow**

```
Browser (vortex-web)
    ↓
[API Client & Interceptors]
    ↓
[Request with Bearer Token]
    ↓
Laravel Backend (PWL26:8000/api)
    ↓
[Database]
    ↓
[Response with data]
    ↓
[Auth Provider & Store update]
    ↓
React Components (re-render)
```

---

## 📝 Current Integration Status

### **Active Integrations** ✅
- ✅ **Authentication**: Login/Register/Logout connected to backend
- ✅ **User Profile**: User data fetched from backend
- ✅ **Events**: Real events loaded from database
- ✅ **Token Management**: JWT tokens stored and refreshed automatically
- ✅ **Error Handling**: Network errors and auth failures handled gracefully

### **Partially Integrated** 🟡
- 🟡 **Orders**: Order creation endpoints ready, but checkout flow still uses local state (see next steps)
- 🟡 **Payments**: Payment API endpoints defined, awaiting payment gateway setup
- 🟡 **Tickets**: Ticket generation endpoints available, awaiting order integration

### **Not Yet Integrated** ⏳
- ⏳ **Real-time updates**: WebSocket implementation for live events
- ⏳ **Image uploads**: Banner upload for admin event creation
- ⏳ **Analytics**: Dashboard statistics from backend
- ⏳ **Chat/Messaging**: Real-time chat features

---

## 🔌 Component Usage Examples

### **1. Login Page**
```typescript
import { useAuth } from '@/lib/auth'

export function LoginPage() {
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const handleLogin = async () => {
    const result = await login({ email, password })
    if (result.ok) {
      navigate('/dashboard')
    }
  }
  
  return (
    <div>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin} disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </div>
  )
}
```

### **2. Events Page**
```typescript
import { useStore } from '@/lib/store'

export function EventsPage() {
  const { events, eventsLoading } = useStore()
  
  if (eventsLoading) return <div>Loading events...</div>
  
  return (
    <div>
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
```

### **3. Profile Update**
```typescript
import { useAuth } from '@/lib/auth'

export function ProfilePage() {
  const { user, updateUser, isLoading } = useAuth()
  const [name, setName] = useState(user?.displayName || '')
  
  const handleUpdate = async () => {
    await updateUser({ displayName: name })
    // User updated in backend and context
  }
  
  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={handleUpdate} disabled={isLoading}>
        Update Profile
      </button>
    </div>
  )
}
```

### **4. Making Custom API Calls**
```typescript
import { apiClient } from '@/lib/api'
import { eventsAPI } from '@/lib/api-endpoints'

// Using pre-built endpoint
const response = await eventsAPI.list(1, 20)

// Or making custom API calls
const customResponse = await apiClient.get('/custom-endpoint')
```

---

## 🔐 Security Notes

1. **JWT Tokens**: Stored in localStorage (consider using httpOnly cookies in production)
2. **CORS**: Already configured in backend with `localhost:3000` as trusted domain
3. **API Key**: Move Gemini API key from frontend to backend environment
4. **Environment Variables**: Never commit `.env.local` with real API keys

---

## 🔧 Next Steps for Full Integration

### **1. Order Creation** (Priority: High)
- Replace local checkout with API call to `POST /api/orders`
- Update store to fetch user's orders from `GET /api/orders`
- Handle payment gateway redirect

### **2. Image Upload** (Priority: High)
- Upload event banners via `multipart/form-data`
- Use `apiClient.postFormData()` for uploads
- Store file paths from backend

### **3. Real-time Events** (Priority: Medium)
- Update store on interval: `setInterval(reloadEvents, 30000)`
- Or implement WebSocket for live updates

### **4. Admin Dashboard** (Priority: Medium)
- Connect admin pages to backend CRUD endpoints
- Implement analytics via `dashboardAPI.getStats()`

### **5. Payment Processing** (Priority: Medium)
- Integrate payment gateway (Stripe, Midtrans, etc.)
- Call `POST /api/payments` with gateway data
- Verify payment with `POST /api/payments/{id}/verify`

### **6. Ticket Validation** (Priority: Low)
- Admin scanner: POST to `/api/tickets/validate`
- Update ticket status to 'CHECKED_IN'
- Real-time sync with backend

---

## 🐛 Troubleshooting

### **Backend Connection Issues**

**Problem**: "Failed to connect to API"
```
Solution:
1. Ensure Laravel backend is running: php artisan serve
2. Check VITE_API_URL in .env.local matches backend URL
3. Check CORS configuration in PWL26/config/cors.php
4. Browser DevTools → Network tab → Check API responses
```

### **Authentication Not Working**

**Problem**: "Login button does nothing"
```
Solution:
1. Check backend returns token in response
2. Verify email/password are correct
3. Check localStorage for 'vortex.auth.token'
4. Backend must accept `email` field (not `username`)
```

### **Events Not Loading**

**Problem**: "Events page shows defaults only"
```
Solution:
1. Check if backend events exist: GET http://localhost:8000/api/events
2. Check console for API errors
3. Verify database migrations ran: php artisan migrate
4. Check EventController index method returns correct format
```

### **Token Expired**

**Problem**: "401 Unauthorized after some time"
```
Solution:
1. Refresh token endpoint must be configured
2. Backend should accept old token + refresh token
3. API client will auto-refresh, then retry request
4. User only kicked to login if refresh also fails
```

---

## 📦 File Structure Overview

```
vortex-web/
├── .env.local .......................... Development env variables (NEW)
├── .env.production ..................... Production env variables (NEW)
├── src/
│   ├── lib/
│   │   ├── api.ts ....................... API client with interceptors (NEW)
│   │   ├── api-endpoints.ts ............. Organized endpoints (NEW)
│   │   ├── auth.tsx ..................... Updated with backend integration
│   │   └── store.tsx .................... Updated with API event loading
│   ├── services/
│   │   └── authService.ts ............... Backend auth service (NEW)
│   └── pages/
│       ├── LoginPage.tsx ................ Ready for async login
│       ├── EventsPage.tsx ............... Now loads from API
│       └── ProfilePage.tsx .............. Can update profile via API

PWL26/
├── app/Http/Controllers/Api/
│   ├── AuthController.php .............. Login/Register endpoints
│   ├── EventController.php ............. Event CRUD endpoints
│   ├── TicketController.php ............ Ticket generation
│   └── ... other controllers
├── routes/
│   └── api.php ......................... API routes ready to use
└── database/
    └── migrations/ ..................... Database schema
```

---

## ✨ Key Features Working

✅ **User Registration & Login** - Backend authenticated users  
✅ **JWT Token Management** - Automatic token refresh  
✅ **Real-time Events** - Load from database  
✅ **User Profiles** - Fetch from backend  
✅ **Error Handling** - Network errors handled gracefully  
✅ **Fallback Mode** - Works offline with defaults  
✅ **TypeScript Support** - Fully typed for safety  

---

## 📞 Testing the Integration

### **Quick Test 1: Check API Connection**
```javascript
// In browser console
const response = await fetch('http://localhost:8000/api/events')
const data = await response.json()
console.log(data) // Should see event data
```

### **Quick Test 2: Check Auth**
```javascript
// After login, check token
localStorage.getItem('vortex.auth.token') // Should have JWT
```

### **Quick Test 3: Check Store**
```javascript
// In React component
const { events, eventsLoading } = useStore()
console.log(events) // Should show database events
```

---

## 🎓 What You Learned

1. **API Integration Pattern**: Central client, organized endpoints, typed responses
2. **Authentication Flow**: JWT tokens, refresh mechanism, auto-retry
3. **Error Handling**: Interceptors, fallbacks, user feedback
4. **Type Safety**: TypeScript with API responses
5. **Environment Management**: Development vs production configs
6. **Backward Compatibility**: New code works with old components

---

## 🎉 You're Now Connected!

Your frontend and backend are now talking to each other. Users can:
- ✅ Create accounts and login with real database
- ✅ View real events from the database
- ✅ Have their profile data persist in the backend
- ✅ Tokens auto-refresh without interruption

**Next:** Follow the "Next Steps for Full Integration" section to connect Orders, Payments, and Tickets!
