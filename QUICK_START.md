# Quick Start Guide - Vortex-Web & PWL26 Integration

**Setup Time**: ~15 minutes  
**Last Updated**: March 30, 2026

---

## 📋 Prerequisites

- Node.js 18+ installed
- PHP 8.1+ with Laravel 11
- Git
- Terminal/Command Prompt
- Text Editor (VS Code recommended)

---

## 🚀 Step 1: Get the Source Code

```bash
cd c:\Kuliah\Semester\ 4\Pemograman\ Web\ Lanjut\Tubes\ PWL\TicketingPWL2026
```

---

## 🔧 Step 2: Setup Backend (PWL26 - Laravel)

### 2.1: Install PHP Dependencies

```bash
cd PWL26
composer install
```

### 2.2: Configure Environment

```bash
# Copy example env file
copy .env.example .env

# Or if you have existing .env, make sure you have:
APP_KEY=your-key-here
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ticketing_pwa
DB_USERNAME=root
DB_PASSWORD=
```

### 2.3: Generate App Key

```bash
php artisan key:generate
```

### 2.4: Run Database Migrations

```bash
php artisan migrate
```

### 2.5: (Optional) Seed Sample Data

```bash
php artisan db:seed
```

### 2.6: Start Laravel Development Server

```bash
php artisan serve
```

**Backend should now be running at**: `http://localhost:8000`

✅ **Verify**: Open browser and go to `http://localhost:8000` - you should see Laravel welcome page

---

## 🎨 Step 3: Setup Frontend (vortex-web - React)

### 3.1: Navigate to Frontend Directory

```bash
cd ../vortex-web
```

### 3.2: Install Node Dependencies

```bash
npm install
```

**This includes the new `axios` package for API calls**

### 3.3: Configure Environment

Create/update `.env.local` file:

```
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=10000
VITE_ENABLE_DEMO_MODE=false
```

### 3.4: Start Development Server

```bash
npm run dev
```

**Frontend should now be running at**: `http://localhost:5173`

✅ **Verify**: Open browser and go to `http://localhost:5173` - you should see the landing page

---

## 🔐 Step 4: Configure CORS (Backend)

The backend needs to allow requests from the frontend.

### Option A: Using Middleware (Recommended)

In `PWL26/app/Http/Middleware/` update or create CORS configuration:

```php
// In TrustHosts.php or appropriate middleware location
protected $hosts = [
    'localhost:8000',
    'localhost:5173',
    'localhost:3000',
    env('APP_URL_FRONTEND'),
];
```

### Option B: Using Package

If using `fruitcake/laravel-cors` package:

```bash
composer require fruitcake/laravel-cors
```

Update `config/cors.php`:

```php
'allowed_origins' => ['http://localhost:5173', 'http://localhost:3000'],
'supports_credentials' => true,
```

### Option C: Quick Middleware Override

Add to `PWL26/routes/api.php`:

```php
Route::middleware(['cors'])->group(function () {
    // Your API routes
});
```

---

## ✅ Step 5: Verify the Integration

### 5.1: Check Backend is Running

```bash
curl http://localhost:8000/api/events
```

**Should return JSON** (even if unauthorized)

### 5.2: Check Frontend is Running

```bash
curl http://localhost:5173
```

**Should return HTML**

### 5.3: Test Login Flow

1. Open `http://localhost:5173` in browser
2. Click "Login" button
3. Enter backend user credentials (create test user if needed):
   - Email: `test@example.com`
   - Password: `password`
4. Should redirect to dashboard if successful

### 5.4: Check Browser Console

Press F12 to open DevTools:
- Go to "Network" tab
- Try to login
- Should see POST request to `/api/auth/login`
- Response should include `token` in JSON
- Check "Application" tab → "LocalStorage" for `auth_token` key

### 5.5: Check for CORS Errors

If you see errors like:
```
Access to XMLHttpRequest has been blocked by CORS policy
```

Then CORS is not configured correctly. See Step 4 again.

---

## 📱 Testing the Integration

### Create a Test User (Backend)

```bash
# Option 1: Using Tinker REPL
php artisan tinker

# Then run:
User::create([
    'name' => 'Test User',
    'email' => 'test@example.com',
    'password' => bcrypt('password'),
    'email_verified_at' => now(),
]);
exit
```

### Option 2: Use Database Seeder

```bash
php artisan db:seed --class=UserSeeder
```

### Login Test

1. Navigate to `http://localhost:5173/login`
2. Enter: `test@example.com` / `password`
3. Should login and redirect to `/events`
4. Check browser console - should see network requests to backend

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────┐
│       React Frontend (vortex-web)           │
│       http://localhost:5173                 │
├─────────────────────────────────────────────┤
│  - React 19.2.4                             │
│  - React Router v7                          │
│  - Axios HTTP Client (NEW ✨)                │
│  - TailwindCSS Styling                      │
│  - Framer Motion Animations                 │
└──────────┬──────────────────────────────────┘
           │
           │ HTTP/REST API (JSON)
           │
           ▼
┌─────────────────────────────────────────────┐
│       Laravel Backend (PWL26)               │
│       http://localhost:8000                 │
├─────────────────────────────────────────────┤
│  - Laravel 11                               │
│  - MySQL Database                           │
│  - RESTful API Endpoints                    │
│  - JWT Authentication                       │
│  - 8 Resource Controllers                   │
│  - 10 Database Tables                       │
└─────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
TicketingPWL2026/
├── PWL26/                          # Laravel Backend
│   ├── app/Http/Controllers/       # API endpoints
│   ├── app/Models/                 # Database models
│   ├── database/migrations/        # Database schema
│   ├── routes/api.php              # API routes
│   └── public/index.php            # Entry point
│
├── vortex-web/                     # React Frontend
│   ├── src/lib/api/                # NEW: API Services ✨
│   │   ├── client.ts               # Axios configuration
│   │   ├── auth.ts                 # Authentication API
│   │   ├── events.ts               # Events API
│   │   ├── orders.ts               # Orders API
│   │   ├── payments.ts             # Payments API
│   │   ├── categories.ts           # Categories API
│   │   ├── waitingList.ts          # Waiting List API
│   │   ├── users.ts                # Users API
│   │   ├── reports.ts              # Reports API
│   │   └── admin.ts                # Admin API
│   ├── src/lib/auth.tsx            # UPDATED: Real Auth ✨
│   ├── src/pages/                  # React page components
│   ├── src/components/             # Reusable components
│   ├── .env.local                  # NEW: Environment Config ✨
│   └── package.json                # UPDATED: Added axios ✨
│
├── INTEGRATION_DOCUMENTATION.md    # NEW: Complete guide ✨
├── CHANGES.md                      # NEW: Detailed changelog ✨
└── IMPLEMENTATION_ROADMAP.md       # NEW: Next steps ✨
```

---

## 🐛 Troubleshooting

### Problem: Backend not starting

```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# If in use, either:
# 1. Stop the process
# 2. Or use different port:
php artisan serve --port=8001
# Then update .env.local to use 8001
```

### Problem: Frontend not starting

```bash
# Clear node modules and reinstall
rm -r node_modules package-lock.json
npm install
npm run dev
```

### Problem: Database connection error

```bash
# Check .env has correct database config
cat .env | grep DB_

# Verify MySQL is running
# (depends on your OS and MySQL installation)

# Try running migrations again
php artisan migrate --fresh --seed
```

### Problem: Login not working

**Check**:
1. Backend is running: `curl http://localhost:8000`
2. Frontend can reach backend: Check Network tab in DevTools
3. CORS is configured (no CORS error in console)
4. Test user exists in database
5. Check `http://localhost:8000/api/user` endpoint exists

### Problem: Token not being stored

**Check**:
1. Open DevTools → Application → LocalStorage
2. Look for key `auth_token`
3. If missing, login failed (check Login response in Network tab)
4. If present, check if subsequent requests include it header

---

## 💡 Quick Tips

### 1. Enable Debug Mode
```bash
# In .env
APP_DEBUG=true
```

### 2. View Database Queries
```bash
# In backend, check storage/logs/laravel.log
tail -f storage/logs/laravel.log
```

### 3. Monitor Network Requests
- Press F12 in browser
- Go to Network tab
- Refresh page
- See all HTTP requests to backend

### 4. Test API Directly
```bash
# Test events endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/events
```

### 5. Check Component Props
```tsx
// Add console logs to debug
useEffect(() => {
  console.log('User:', user)
  console.log('isAuthenticated:', isAuthenticated)
}, [user, isAuthenticated])
```

---

## 📚 Documentation Files

You have three main documentation files:

1. **[INTEGRATION_DOCUMENTATION.md](INTEGRATION_DOCUMENTATION.md)**
   - Complete integration overview
   - All API endpoints documented
   - Feature specifications
   - 200+ lines of detailed info

2. **[CHANGES.md](CHANGES.md)**
   - Every file created/modified detailed
   - Code examples for each change
   - Breaking changes explained
   - Migration guide for components

3. **[IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md)**
   - Phase 2 component updates needed
   - Estimated time for each page
   - Code examples for implementation
   - Timeline and checklist

---

## ✨ What's New in This Version

✅ **API Client Layer** - Complete axios setup with interceptors  
✅ **10 API Services** - Covers all backend endpoints  
✅ **Updated Auth** - Real backend authentication  
✅ **Environment Config** - Easy API URL configuration  
✅ **Comprehensive Docs** - 3 documentation files  
✅ **Type Safety** - Full TypeScript support  
✅ **Error Handling** - Proper error states and messages  
✅ **Loading States** - isLoading flags in auth context  

---

## 🎓 Learning Resources

### API Services Pattern
Each API file follows this pattern:
```typescript
export const featureAPI = {
  getList: async (...) => { /* GET request */ },
  getById: async (...) => { /* GET request */ },
  create: async (...) => { /* POST request */ },
  update: async (...) => { /* PATCH request */ },
  delete: async (...) => { /* DELETE request */ },
}
```

### Using in Components
```typescript
import { featureAPI } from '../lib/api/feature'

export function MyComponent() {
  const [data, setData] = useState([])
  
  useEffect(() => {
    const fetch = async () => {
      const response = await featureAPI.getList()
      if (response.success) {
        setData(response.data)
      }
    }
    fetch()
  }, [])
  
  return <div>{/* render data */}</div>
}
```

---

## 🤝 Getting Help

### If something breaks:
1. Check error message in console/terminal
2. Refer to [Troubleshooting](#-troubleshooting) section
3. Check [INTEGRATION_DOCUMENTATION.md](INTEGRATION_DOCUMENTATION.md) for API specs
4. Check [CHANGES.md](CHANGES.md) for what changed
5. Look at existing component examples

### For questions about:
- **API Endpoints** → See [INTEGRATION_DOCUMENTATION.md](INTEGRATION_DOCUMENTATION.md)
- **What Changed** → See [CHANGES.md](CHANGES.md)
- **Next Steps** → See [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md)
- **How to Use APIs** → See code examples in `src/lib/api/`

---

## 🎉 Success Checklist

When you see all of these, integration is working:

- [ ] Both servers running (Port 8000 & 5173)
- [ ] Frontend loads without errors
- [ ] Can navigate to login page
- [ ] Can login with test user account
- [ ] Token stored in localStorage after login
- [ ] Redirects to /events after login
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows requests to backend
- [ ] API responses have data

**Congratulations! Your integration is working! 🚀**

---

**Next**: Check [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) to continue with Phase 2 (Component updates)
