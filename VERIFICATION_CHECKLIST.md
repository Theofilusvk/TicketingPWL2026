# Verification Checklist - Integration Working?

## ✅ Pre-Flight Checklist

Execute these steps to verify the integration is working correctly.

---

## 1️⃣ **Backend Setup** (5 minutes)

### Database
```bash
cd PWL26
php artisan migrate
# ✅ Should show "Migrated: 202x_01_01_00000x_*" messages
```

### Start Backend
```bash
php artisan serve
# ✅ Should show "Server running on [http://127.0.0.1:8000]"
```

### **Checklist**
- [ ] Backend running on http://localhost:8000
- [ ] Database migrated successfully (check database/TicketingPWL.sql exists)
- [ ] No errors in artisan output
- [ ] Can open http://localhost:8000 in browser (shows Laravel page)

---

## 2️⃣ **Frontend Setup** (5 minutes)

### Install Dependencies
```bash
cd vortex-web
npm install
# ✅ Should complete without errors
```

### Check .env.local
```bash
# Open .env.local and verify:
VITE_API_URL=http://localhost:8000/api
VITE_APP_URL=http://localhost:8000
VITE_GEMINI_API_KEY=your-key
```

### Start Frontend
```bash
npm run dev
# ✅ Should show "Local: http://localhost:5173"
```

### **Checklist**
- [ ] Frontend running on http://localhost:5173
- [ ] npm install completed without errors
- [ ] No TypeScript compilation errors
- [ ] Browser opens without errors

---

## 3️⃣ **API Connection Test** (3 minutes)

### Test Backend API
Open browser console and run:
```javascript
fetch('http://localhost:8000/api/events')
  .then(r => r.json())
  .then(d => console.log('Events:', d.data))
```

### **Checklist**
- [ ] No CORS errors in console
- [ ] Response shows `{success: true, data: [...]}`
- [ ] Event data visible (even if empty array)
- [ ] Backend API accessible from frontend

---

## 4️⃣ **Authentication Test** (5 minutes)

### Create Test Account
1. Go to http://localhost:5173
2. Click "Sign Up"
3. Fill form:
   - **Name**: Test User
   - **Email**: test@example.com
   - **Password**: testpass123
4. Click Sign Up

### **Checklist**
- [ ] Sign up page loads without errors
- [ ] Form submission doesn't timeout
- [ ] Redirected to dashboard after signup
- [ ] User profile shows "Test User"
- [ ] No errors in browser console
- [ ] No errors in backend console

### Verify Token
1. Open browser DevTools (F12)
2. Go to Application → LocalStorage
3. Look for `vortex.auth.token`

### **Checklist**
- [ ] Token exists in localStorage
- [ ] Token is not empty (should be long JWT string)
- [ ] Token starts with "eyJ" (JWT format)

---

## 5️⃣ **User Profile Test** (3 minutes)

### Load User Profile
1. Go to http://localhost:5173/profile
2. Page should load your user info

### **Checklist**
- [ ] Profile page loads
- [ ] Shows your email (test@example.com)
- [ ] Shows your name (Test User)
- [ ] No errors in console

### Verify Backend
```javascript
// In browser console
fetch('http://localhost:8000/api/user', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('vortex.auth.token')
  }
})
.then(r => r.json())
.then(d => console.log('User:', d.data))
```

### **Checklist**
- [ ] Response shows your user data
- [ ] Email matches what you signed up with
- [ ] No 401 Unauthorized errors

---

## 6️⃣ **Events Loading Test** (3 minutes)

### View Events
1. Go to http://localhost:5173/events
2. Page should load events

### **Checklist**
- [ ] Events page loads
- [ ] Shows at least 3 events (or default events if DB empty)
- [ ] Event cards have title, date, price
- [ ] No errors in console

### Check Network
1. Open DevTools → Network tab
2. Load http://localhost:5173/events
3. Look for `api/events` request

### **Checklist**
- [ ] `GET http://localhost:8000/api/events` shows status 200
- [ ] Response is JSON with `success: true`
- [ ] Response time is <2 seconds

### Verify Database Events
```javascript
// In browser console
const store = window.__VORTEX_STORE__ // If exposed
console.log(store?.events)
// Or check: fetch and see raw response
```

---

## 7️⃣ **Cart & Checkout Test** (5 minutes)

### Add to Cart
1. Go to an event
2. Click "Add to Cart" ✅ (should work - local state)
3. Go to Cart page
4. See item in cart ✅ (should work - local state)

### **Checklist**
- [ ] Can add events to cart
- [ ] Cart shows items
- [ ] Cart persists in localStorage
- [ ] Can remove items
- [ ] Can clear cart

---

## 8️⃣ **Logout Test** (2 minutes)

### Logout
1. Go to Profile
2. Click Logout
3. Should redirect to Login page

### **Checklist**
- [ ] Logout works immediately
- [ ] Token removed from localStorage
- [ ] Redirected to login
- [ ] Cannot access protected pages without login

### Verify Token Cleared
```javascript
// In browser console after logout
localStorage.getItem('vortex.auth.token') // Should be null
```

---

## 9️⃣ **Login Test** (5 minutes)

### Login with Account
1. Go to http://localhost:5173/login
2. Email: test@example.com
3. Password: testpass123
4. Click Login

### **Checklist**
- [ ] Login form works
- [ ] No timeout issues
- [ ] Redirected to dashboard
- [ ] User profile loads
- [ ] Token in localStorage

### **Checklist** - Wrong Credentials
1. Try wrong password
2. Should show error message

### **Checklist**
- [ ] Error message displayed
- [ ] Not redirected
- [ ] Token not created

---

## 🔟 **Error Handling Test** (3 minutes)

### Stop Backend
```bash
# In terminal with "php artisan serve", press Ctrl+C
```

### Try to Load Events
1. Go to /events
2. Should show default events (fallback)
3. No red error overlay

### **Checklist**
- [ ] Events still show (from defaults)
- [ ] "Events loading" message may appear
- [ ] No console errors (warnings OK)
- [ ] App doesn't crash

### Restart Backend
```bash
php artisan serve
# Then refresh page
```

### **Checklist**
- [ ] Page reloads events when backend back online
- [ ] Data updates after refresh
- [ ] No errors

---

## 🏁 **Final Verification** (5 minutes)

### Browser Console Check
- [ ] No red error messages
- [ ] Maximum 2-3 yellow warnings
- [ ] Network calls to API show 200-201 status

### Backend Console Check
- [ ] No Error messages
- [ ] See successful log entries
- [ ] `GET /api/events` shows 200 response
- [ ] `GET /api/user` shows 200 response

### Feature Completeness
- [ ] Can signup ✅
- [ ] Can login ✅
- [ ] Can logout ✅
- [ ] Can view profile ✅
- [ ] Can view events ✅
- [ ] Can add to cart ✅
- [ ] No CORS errors ✅
- [ ] No auth errors ✅

---

## 🎉 **Success Criteria**

### ✅ ALL checks passed = Integration Working!

If you can check all items above:
- Your frontend is connected to backend ✅
- Authentication is working ✅
- Events load from database ✅
- User data flows correctly ✅
- Error handling works ✅
- Ready for next features ✅

---

## ⚠️ **Troubleshooting**

### If Backend Connection Fails
```
1. Verify: php artisan serve is running
2. Verify: VITE_API_URL in .env.local is correct
3. Check: Frontend can access http://localhost:8000
4. Check: No firewall blocking port 8000
```

### If Login Fails
```
1. Database migrated? (php artisan migrate)
2. User exists in database?
3. Backend returns response? (check Network tab)
4. Response has 'token' field?
5. Password correct?
```

### If Events Not Loading
```
1. Backend events API working?
   GET http://localhost:8000/api/events
2. Events exist in database?
3. CORS allowed?
4. Check browser Network → api/events response
```

### If Token Issues
```
1. Check localStorage for 'vortex.auth.token'
2. Token should be long string (JWT format: eyJ...)
3. Try: localStorage.removeItem('vortex.auth.token')
4. Login again and verify token created
```

---

## 📊 **Quick Status Table**

| Component | Status | Note |
|-----------|--------|------|
| Backend Server | ✅/❌ | php artisan serve |
| Database | ✅/❌ | php artisan migrate |
| Frontend Server | ✅/❌ | npm run dev |
| API Connection | ✅/❌ | Test fetch call |
| Authentication | ✅/❌ | Can signup/login |
| User Profile | ✅/❌ | Loads from API |
| Events | ✅/❌ | Loads from database |
| Local Cart | ✅/❌ | localStorage working |
| Error Handling | ✅/❌ | Works with offline |

---

## 🎓 What Success Looks Like

**Console should show:**
```
✅ No red errors
✅ User logged in: {id, name, email}
✅ Events loaded: 3-5 event objects
✅ API responses 200-201 OK
✅ Cart persisting in localStorage
```

**Network tab should show:**
```
✅ GET /api/events - 200
✅ POST /api/auth/register - 201
✅ POST /api/auth/login - 200
✅ GET /api/user - 200
```

**Features should work:**
```
✅ Sign up → account created
✅ Login → redirected to dashboard
✅ View Events → from database
✅ View Profile → user data loads
✅ Logout → session cleared
```

---

**If everything checks out above: 🎉 YOU'RE CONNECTED!**

Continue to [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for next steps.
