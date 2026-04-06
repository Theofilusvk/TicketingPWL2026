# Quick Start Guide - Frontend-Backend Connection

## 🚀 Get Running in 5 Minutes

### **Step 1: Start the Backend**
```bash
cd PWL26
php artisan serve
```
✅ Backend runs on `http://localhost:8000`

### **Step 2: Start the Frontend**
```bash
cd vortex-web
npm run dev
```
✅ Frontend runs on `http://localhost:5173`

### **Step 3: Test the Connection**
1. Open `http://localhost:5173` in browser
2. Go to Login page
3. Try to login/signup
4. Check browser console for any errors

---

## 📊 What's Connected Now

| Feature | Status | Details |
|---------|--------|---------|
| **User Authentication** | ✅ Connected | Login/Register from database |
| **User Profile** | ✅ Connected | User data from backend |
| **Events List** | ✅ Connected | Events loaded from database |
| **Event Details** | ✅ Connected | Event info from API |
| **Shopping Cart** | ✅ Local State | Still uses localStorage (OK) |
| **Orders** | 🟡 Partial | API ready, checkout needs update |
| **Payments** | 🟡 Partial | API ready, gateway needs setup |
| **Tickets** | 🟡 Partial | API ready, generation needs order sync |

---

## 🔑 Key Endpoints Ready to Use

**Auth**
- `POST /api/auth/login` → `authAPI.login()`
- `POST /api/auth/register` → `authAPI.register()`
- `GET /api/user` → `authAPI.getCurrentUser()`

**Events**
- `GET /api/events` → `eventsAPI.list()`
- `GET /api/events/{id}` → `eventsAPI.get(id)`
- `POST /api/events` → `eventsAPI.create(data)`

**Orders**
- `GET /api/orders` → `ordersAPI.list()`
- `POST /api/orders` → `ordersAPI.create(data)`

**Tickets**
- `POST /api/tickets/generate` → `ticketsAPI.generate()`
- `POST /api/tickets/validate` → `ticketsAPI.validate(code)`

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for all endpoints.

---

## 🔧 Environment Setup (Already Done)

- ✅ `.env.local` created with API URL
- ✅ Axios installed
- ✅ API client configured
- ✅ Auth service wired up
- ✅ Store connected to events API

**If you need to change API URL:**
Edit `.env.local`:
```
VITE_API_URL=http://your-backend-url:8000/api
```

---

## 💡 Using the API in Your Components

### **Fetch Data**
```typescript
import { eventsAPI } from '@/lib/api-endpoints'

const response = await eventsAPI.list(1, 20) // page, perPage
console.log(response.data.data) // Array of events
```

### **Authenticate**
```typescript
import { useAuth } from '@/lib/auth'

const { login, user, isLoading } = useAuth()

const result = await login({ 
  email: 'user@example.com', 
  password: 'password' 
})

if (result.ok) {
  console.log('Logged in:', result.user)
}
```

### **Get Current User**
```typescript
import { useAuth } from '@/lib/auth'

const { user } = useAuth() // Auto-loaded from API on mount
console.log(user.displayName) // User data from backend
```

---

## 🧪 Test with These Credentials

Create a test user first via signup, or use existing users from database.

**Example (if you seed db):**
- Email: `test@example.com`
- Password: `password`

---

## ⚠️ Common Issues

### **"API not responding"**
```
1. Check: Is Laravel server running? (php artisan serve)
2. Check: Is it on 8000? (http://localhost:8000)
3. Check: .env.local has correct VITE_API_URL
```

### **"Login doesn't work"**
```
1. Ensure database is migrated: php artisan migrate
2. Verify credentials exist in database
3. Check backend returns response with 'token' field
```

### **"Events not loading from API"**
```
1. Check: Are events in database?
2. Try direct URL: http://localhost:8000/api/events
3. Look in browser console → Network tab
```

---

## 📝 Quick Integration Checklist

- [ ] Backend running (php artisan serve)
- [ ] Frontend running (npm run dev)
- [ ] Can open http://localhost:5173
- [ ] Can see Login page
- [ ] Can create new account
- [ ] Can login with new account
- [ ] Can see events on Events page
- [ ] Browser console has no API errors

If all checked: **✅ You're connected!**

---

## 🎯 Next Steps

1. **Test the integration** - Follow checklist above
2. **Read the guide** - See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for details
3. **Connect Orders** - Update checkout to create real orders
4. **Add Payments** - Integrate payment gateway
5. **Generate Tickets** - Create tickets after payment success

---

## 📚 File Reference

**Core Integration Files:**
- `src/lib/api.ts` - API client with interceptors
- `src/lib/api-endpoints.ts` - All endpoint definitions
- `src/services/authService.ts` - Authentication logic
- `src/lib/auth.tsx` - Auth context (updated)
- `src/lib/store.tsx` - Store with event loading (updated)
- `.env.local` - Development configuration

**Configuration:**
- `vite.config.ts` - Environment setup
- `package.json` - Dependencies (axios added)

---

## 💬 Getting Help

1. Check browser console for errors
2. Check Network tab to see API calls
3. Read [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for detailed explanation
4. Check backend logs: `php artisan serve` output

---

**Everything is ready. Go test it! 🚀**
