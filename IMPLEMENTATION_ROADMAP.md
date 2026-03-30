# Implementation Roadmap & Next Steps

**Status**: Phase 1 Complete ✅ - API Layer Structure Ready  
**Date**: March 30, 2026  
**Project**: Vortex-Web & PWL26 Integration

---

## ✅ Phase 1: Complete - API Infrastructure

### What Was Done:

✅ **API Service Layer** (8 services created)
- `client.ts` - Axios HTTP client with interceptors
- `auth.ts` - Authentication endpoints
- `events.ts` - Event management
- `orders.ts` - Orders & cart operations
- `payments.ts` - Payment processing
- `categories.ts` - Ticket categories
- `waitingList.ts` - Event waiting lists
- `users.ts` - User management
- `reports.ts` - Reports & analytics
- `admin.ts` - Admin dashboard operations

✅ **Authentication System Updated**
- Replaced localStorage mock with Backend API
- JWT token storage & refresh
- Session restoration on app load
- Error handling & loading states
- TypeScript types for all responses

✅ **Environment Configuration**
- `.env.local` with API base URL
- Timeout configuration
- Feature flags structure

✅ **Documentation**
- `INTEGRATION_DOCUMENTATION.md` - 200+ lines comprehensive guide
- `CHANGES.md` - Detailed changelog of all modifications
- API contract examples
- Migration guide for component updates

### Files Created: 12
### Files Modified: 2
### Dependencies Added: 1 (axios)

---

## 📋 Phase 2: Pages Integration (NOT YET STARTED)

This phase involves connecting React components to the API services created in Phase 1.

### 2.1: Authentication Pages (HIGH PRIORITY)

#### **vortex-web/src/pages/LoginPage.tsx**

**Current State**: Form submission not connected to backend

**Required Changes**:
```typescript
// Import auth API
import { useAuth } from '../lib/auth'

export function LoginPage() {
  const { login, isLoading, error } = useAuth()

  const handleLogin = async (email: string, password: string) => {
    const result = await login({ email, password })
    if (result.ok) {
      // Navigate to dashboard
      navigate('/events')
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      handleLogin(email, password)
    }}>
      {error && <div className="error">{error}</div>}
      <button disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

**Affected Files**: 1
**Estimated Time**: 1-2 hours

---

#### **vortex-web/src/pages/RegisterPage.tsx**

**Current State**: Sign up form not connected

**Required Changes**:
```typescript
import { useAuth } from '../lib/auth'

const handleSignup = async (formData) => {
  const result = await useAuth().signup({
    name: formData.name,
    email: formData.email,
    password: formData.password,
    password_confirmation: formData.passwordConfirm
  })
  if (result.ok) {
    navigate('/login')
  }
}
```

**Affected Files**: 1
**Estimated Time**: 1-2 hours

---

### 2.2: Events Pages (HIGH PRIORITY)

#### **vortex-web/src/pages/EventsPage.tsx**

**Current State**: Shows mock hardcoded events

**Required Changes**:
```typescript
import { eventsAPI } from '../lib/api/events'
import { useState, useEffect } from 'react'

export function EventsPage() {
  const [events, setEvents] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      const response = await eventsAPI.getEvents(page, 15)
      if (response.success) {
        setEvents(response.data)
      }
      setLoading(false)
    }
    fetchEvents()
  }, [page])

  if (loading) return <LoadingSpinner />
  
  return (
    <div className="events-grid">
      {events.map(event => (
        <EventCard key={event.event_id} event={event} />
      ))}
    </div>
  )
}
```

**Updates Needed**:
- Fetch from `eventsAPI.getEvents()`
- Handle pagination
- Add search functionality (optional)
- Add filter by category (optional)

**Affected Files**: 1
**Estimated Time**: 2 hours

---

#### **vortex-web/src/pages/EventDetailPage.tsx**

**Current State**: Mock event details

**Required Changes**:
```typescript
import { eventsAPI } from '../lib/api/events'
import { waitingListAPI } from '../lib/api/waitingList'

export function EventDetailPage({ eventId }: { eventId: number }) {
  const [event, setEvent] = useState(null)
  const [isWaiting, setIsWaiting] = useState(false)

  useEffect(() => {
    const fetchEvent = async () => {
      const response = await eventsAPI.getEventById(parseInt(eventId))
      if (response.success) {
        setEvent(response.data)
      }
    }
    fetchEvent()
  }, [eventId])

  const handleJoinWaitingList = async () => {
    await waitingListAPI.joinWaitingList(event.event_id)
    setIsWaiting(true)
  }

  return (
    <div>
      {/* Event details */}
      <button onClick={handleJoinWaitingList}>
        Join Waiting List
      </button>
    </div>
  )
}
```

**Updates Needed**:
- Fetch event from `eventsAPI.getEventById()`
- Show available tickets
- Show price information
- Add reserve/buy button
- Add waiting list join option

**Affected Files**: 1
**Estimated Time**: 2 hours

---

### 2.3: Orders & Cart Pages (HIGH PRIORITY)

#### **vortex-web/src/pages/CartPage.tsx**

**Current State**: Local state-based cart

**Required Changes**:
```typescript
import { ordersAPI } from '../lib/api/orders'

export function CartPage() {
  const [cart, setCart] = useState([])

  const handleAddToCart = async (eventId: number, items: any[]) => {
    // This will create an order on the backend
    const response = await ordersAPI.createOrder({
      event_id: eventId,
      items: items,
      payment_method: 'credit_card'
    })
    if (response.success) {
      navigate('/checkout', { state: { orderId: response.data.order_id } })
    }
  }

  const handleRemoveFromCart = async (orderId: number, itemId: number) => {
    await orderItemsAPI.deleteOrderItem(orderId, itemId)
    // Refresh cart
  }

  return (
    <div className="cart">
      {/* Display cart items from backend */}
      <button onClick={() => handleCheckout()}>Checkout</button>
    </div>
  )
}
```

**Updates Needed**:
- Replace local cart state with backend orders
- Show order items from API
- Add quantity controls
- Remove items via API
- Calculate total from backend

**Affected Files**: 1
**Estimated Time**: 2.5 hours

---

#### **vortex-web/src/pages/CheckoutPage.tsx**

**Current State**: Mock checkout form

**Required Changes**:
```typescript
import { paymentsAPI } from '../lib/api/payments'
import { ordersAPI } from '../lib/api/orders'

export function CheckoutPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    const fetchOrder = async () => {
      const response = await ordersAPI.getOrderById(orderId)
      if (response.success) {
        setOrder(response.data)
      }
    }
    fetchOrder()
  }, [orderId])

  const handlePayment = async (paymentMethod: string) => {
    const response = await paymentsAPI.createPayment({
      order_id: order.order_id,
      amount: order.price,
      payment_gateway: paymentMethod
    })
    
    if (response.success) {
      // Process with payment gateway
      // Then redirect to success page
      navigate('/success', { state: { orderId: order.order_id } })
    }
  }

  return (
    <div className="checkout">
      <OrderSummary order={order} />
      <PaymentForm onSubmit={handlePayment} />
    </div>
  )
}
```

**Updates Needed**:
- Load order from API
- Display order summary
- Process payment via API
- Handle payment gateway integration
- Redirect on success

**Affected Files**: 1
**Estimated Time**: 3 hours (depends on payment gateway complexity)

---

#### **vortex-web/src/pages/SuccessPage.tsx**

**Current State**: Static success message

**Required Changes**:
```typescript
import { ordersAPI } from '../lib/api/orders'

export function SuccessPage() {
  const { orderId } = useLocation().state
  const [order, setOrder] = useState(null)

  useEffect(() => {
    const fetchOrder = async () => {
      const response = await ordersAPI.getOrderById(orderId)
      if (response.success) {
        setOrder(response.data)
      }
    }
    fetchOrder()
  }, [orderId])

  return (
    <div className="success">
      <h1>Order Confirmed!</h1>
      <p>Order ID: {order?.order_id}</p>
      <p>Total: {order?.price}</p>
    </div>
  )
}
```

**Estimated Time**: 1 hour

---

### 2.4: User Pages (MEDIUM PRIORITY)

#### **vortex-web/src/pages/ProfilePage.tsx**

**Required Changes**:
```typescript
import { useAuth } from '../lib/auth'

export function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [formData, setFormData] = useState(user)

  const handleSave = async () => {
    await updateUser(formData)
    // Show success message
  }

  return (
    <form onSubmit={() => handleSave()}>
      <input value={formData.name} onChange={() => {}} />
      <textarea value={formData.bio} onChange={() => {}} />
      <button type="submit">Save Profile</button>
    </form>
  )
}
```

**Estimated Time**: 1.5 hours

---

#### **vortex-web/src/pages/HistoryPage.tsx**

**Required Changes**:
```typescript
import { ordersAPI } from '../lib/api/orders'

export function HistoryPage() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    const fetchOrders = async () => {
      const response = await ordersAPI.getOrders()
      if (response.success) {
        setOrders(response.data)
      }
    }
    fetchOrders()
  }, [])

  return (
    <div>
      {orders.map(order => (
        <OrderCard key={order.order_id} order={order} />
      ))}
    </div>
  )
}
```

**Estimated Time**: 1.5 hours

---

#### **vortex-web/src/pages/TicketsPage.tsx**

**Required Changes**:
```typescript
import { ordersAPI } from '../lib/api/orders'
import QRCode from 'qrcode.react'

export function TicketsPage() {
  const [tickets, setTickets] = useState([])

  useEffect(() => {
    const fetchTickets = async () => {
      const response = await ordersAPI.getOrders()
      if (response.success) {
        // Filter for confirmed/valid tickets
        setTickets(response.data)
      }
    }
    fetchTickets()
  }, [])

  return (
    <div className="tickets">
      {tickets.map(ticket => (
        <Ticket key={ticket.order_id} ticket={ticket}>
          <QRCode value={ticket.order_id.toString()} size={200} />
        </Ticket>
      ))}
    </div>
  )
}
```

**Note**: May need to install `qrcode.react` package

**Estimated Time**: 2 hours

---

### 2.5: Admin Pages (MEDIUM PRIORITY)

#### **vortex-web/src/pages/AdminDashboardPage.tsx**

```typescript
import { adminAPI } from '../lib/api/admin'

export function AdminDashboardPage() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      const response = await adminAPI.getDashboardStats()
      if (response.success) {
        setStats(response.data)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="dashboard">
      <StatCard label="Users" value={stats?.total_users} />
      <StatCard label="Events" value={stats?.total_events} />
      <StatCard label="Revenue" value={`$${stats?.total_revenue}`} />
    </div>
  )
}
```

**Estimated Time**: 1.5 hours

---

#### **vortex-web/src/pages/AdminEventsPage.tsx**

```typescript
import { eventsAPI } from '../lib/api/events'

export function AdminEventsPage() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    const response = await eventsAPI.getEvents()
    if (response.success) {
      setEvents(response.data)
    }
  }

  const handleDelete = async (id: number) => {
    await eventsAPI.deleteEvent(id)
    fetchEvents()
  }

  return (
    <div className="admin-events">
      <table>
        <tbody>
          {events.map(event => (
            <tr key={event.event_id}>
              <td>{event.name}</td>
              <td>{event.date}</td>
              <td>
                <button onClick={() => handleDelete(event.event_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

**Estimated Time**: 2 hours

---

#### **Other Admin Pages**

- **AdminUsersPage**: Use `usersAPI.getUsers()`, `updateUser()`, `deleteUser()`
- **AdminVenuesPage**: Use `adminAPI.venues.*` methods
- **AdminDropsPage**: Use `adminAPI.drops.*` methods
- **AdminNewsPage**: Use `adminAPI.news.*` methods
- **AdminScannerPage**: Use `adminAPI.scanner.*` methods

**Total Estimated Time for All Admin Pages**: 6-8 hours

---

## 🎯 Phase 3: Backend CORS & Testing (CRITICAL)

### Required Backend Changes:

#### **PWL26/app/Http/Middleware/TrustHosts.php**

Add CORS configuration:
```php
// In bootstrap/app.php or appropriate middleware file
->withMiddleware(function (Middleware $middleware) {
    $middleware->use([
        \App\Http\Middleware\EncryptCookies::class,
        \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
        \Illuminate\Session\Middleware\StartSession::class,
        \Illuminate\View\Middleware\ShareErrorsFromSession::class,
        \App\Http\Middleware\VerifyCsrfToken::class,
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ]);
    
    // Add CORS
    $middleware->append(
        \Fruitcake\Cors\HandleCors::class
    );
})
```

Or if using `laravel-cors` package:

**PWL26/config/cors.php**:
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods' => ['*'],
'allowed_origins' => [
    'http://localhost:3000',
    'http://localhost:5173', // Vite default
],
'allowed_origins_patterns' => [],
'allowed_headers' => ['*'],
'exposed_headers' => ['Content-Length'],
'max_age' => 0,
'supports_credentials' => true,
```

### Testing Checklist:

- [ ] Backend running at `http://localhost:8000`
- [ ] Frontend running at `http://localhost:5173`
- [ ] CORS headers present in responses
- [ ] Login request succeeds
- [ ] Token stored in localStorage
- [ ] API requests include Authorization header
- [ ] Events list loads
- [ ] Error handling works
- [ ] Session restoration works
- [ ] Logout clears token

---

## 📊 Phase Summary Table

| Phase | Component | Status | Estimated Time |
|-------|-----------|--------|-----------------|
| 1 | API Services | ✅ Complete | - |
| 1 | Auth Provider | ✅ Complete | - |
| 1 | Env Config | ✅ Complete | - |
| 1 | Documentation | ✅ Complete | - |
| 2 | LoginPage | ⏳ Pending | 1-2h |
| 2 | RegisterPage | ⏳ Pending | 1-2h |
| 2 | EventsPage | ⏳ Pending | 2h |
| 2 | EventDetailPage | ⏳ Pending | 2h |
| 2 | CartPage | ⏳ Pending | 2.5h |
| 2 | CheckoutPage | ⏳ Pending | 3h |
| 2 | SuccessPage | ⏳ Pending | 1h |
| 2 | ProfilePage | ⏳ Pending | 1.5h |
| 2 | HistoryPage | ⏳ Pending | 1.5h |
| 2 | TicketsPage | ⏳ Pending | 2h |
| 2 | AdminDashboardPage | ⏳ Pending | 1.5h |
| 2 | AdminEventsPage | ⏳ Pending | 2h |
| 2 | Other Admin Pages | ⏳ Pending | 6-8h |
| 3 | Backend CORS | ⏳ Pending | 1h |
| 3 | Integration Testing | ⏳ Pending | 3-4h |

---

## ⏱️ Overall Timeline

- **Phase 1**: ✅ Complete (Done)
- **Phase 2**: 🔄 In Progress (Should take 30-40 hours)
- **Phase 3**: 📅 Planned (Should take 4-5 hours)

**Total Project Duration**: ~50 hours

---

## 🚀 How to Start Phase 2

### Step 1: Install Dependencies
```bash
cd vortex-web
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Update LoginPage Component
- Open `src/pages/LoginPage.tsx`
- Import `useAuth()` hook
- Connect form submission to `login()` function
- Add error display
- Add loading spinner

### Step 4: Test
- Try logging in with a backend user account
- Verify token is stored
- Check browser network tab for Authorization header

### Step 5: Continue with Other Pages
Follow the same pattern:
1. Import necessary API services
2. Use `useEffect` to fetch data
3. Display in component
4. Add loading/error states

---

## 📚 Reference Links

- **API Documentation**: [INTEGRATION_DOCUMENTATION.md](../INTEGRATION_DOCUMENTATION.md)
- **Change Log**: [CHANGES.md](../CHANGES.md)
- **API Services**: `vortex-web/src/lib/api/`
- **Auth Context**: `vortex-web/src/lib/auth.tsx`

---

## 🆘 Common Issues & Solutions

### Issue: CORS Error
**Solution**: Make sure CORS is configured in Laravel backend. Check `config/cors.php` or middleware.

### Issue: 401 Unauthorized
**Solution**: Token might be expired or invalid. Check localStorage for `auth_token`. Try logging in again.

### Issue: Network Timeout
**Solution**: Check if backend is running at `VITE_API_BASE_URL`. Increase `VITE_API_TIMEOUT` if needed.

### Issue: "useAuth must be used within AuthProvider"
**Solution**: Make sure `AuthProvider` wraps your app in `main.tsx`.

---

## 📝 Notes for Team

- **Consistency**: All components should follow the same pattern for API calls
- **Error Handling**: Always show error messages to users
- **Loading States**: Show spinners/skeletons while loading
- **Type Safety**: Use TypeScript types from API services
- **Testing**: Test each component with real backend before moving to next one

---

**End of Implementation Roadmap**
