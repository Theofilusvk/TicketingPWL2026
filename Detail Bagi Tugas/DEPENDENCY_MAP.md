# 🗺️ TEAM STRUCTURE & DEPENDENCY MAP

## 👥 Team Organization

```
PROJECT LEAD / SCRUM MASTER
        |
        ├─── FRONTEND TEAM (2 people)
        │    ├─ Person 1: Analytics & Reports
        │    └─ Person 2: UX & Payment
        │
        ├─── BACKEND TEAM (2 people)
        │    ├─ Person 1: Events & Registration
        │    └─ Person 2: Payment & Analytics
        │
        └─── QA / TESTER (shared responsibility)
```

---

## 🔗 FEATURE DEPENDENCIES

### Dependency Chain

```
1. EVENT MANAGEMENT
   ┌─────────────────────────┐
   │ Backend 1: Event Model  │ (Database, validation)
   └────────────┬────────────┘
                │
                ├──────────────────────────┐
                │                          │
       ┌────────▼─────────┐      ┌────────▼──────────┐
       │ Frontend 1:       │      │ Backend 1:       │
       │ Event CRUD UI     │      │ Event Endpoints  │
       │ + Poster Preview  │      │ + Delete Check   │
       └───────────────────┘      └──────────────────┘


2. USER REGISTRATION & ROLES
   ┌──────────────────────────┐
   │ Backend 1: Auth Logic    │ (First user = admin)
   └────────────┬─────────────┘
                │
       ┌────────▼──────────────┐
       │ Frontend: Login Page   │ (existing - no change)
       └───────────────────────┘


3. CHECKOUT & PAYMENT FLOW
   ┌────────────────────────────┐
   │ Frontend 2: Profile        │
   │ Auto-fill + Passenger Form │
   └──────────┬─────────────────┘
              │
   ┌──────────▼────────────────────┐
   │ Frontend 2: Midtrans Payment   │
   │ UI + Snap Widget Integration   │
   └──────────┬────────────────────┘
              │
   ┌──────────▼────────────────────┐
   │ Backend 2: Payment Processor   │
   │ Midtrans Service + Callback    │
   └──────────┬────────────────────┘
              │
   ┌──────────▼────────────────────┐
   │ Backend 2: Email System        │
   │ QR Generation + Ticket Email   │
   └────────────────────────────────┘


4. NOTIFICATIONS (ADMIN)
   ┌────────────────────────────┐
   │ Backend 1: Event Created   │
   │ + Notification Job         │
   └──────────┬─────────────────┘
              │
   ┌──────────▼────────────────────┐
   │ Frontend (NotificationBar)     │
   │ Real-time notification display │
   └────────────────────────────────┘


5. ANALYTICS & REPORTING
   ┌────────────────────────┐
   │ Backend 2: Analytics   │
   │ Service + SQL Queries  │
   └──────────┬─────────────┘
              │
              ├──────────────────┬──────────────────┐
              │                  │                  │
   ┌──────────▼─────┐  ┌──────────▼─────┐  ┌──────▼──────┐
   │ Frontend 1:    │  │ Frontend 1:    │  │ Frontend 1: │
   │ Analytics      │  │ Charts UI      │  │ Report      │
   │ Dashboard      │  │ (Recharts)     │  │ Builder     │
   └────────────────┘  └────────────────┘  └─────────────┘
              │                                    │
              └────────────────┬───────────────────┘
                               │
                   ┌───────────▼────────────┐
                   │ Backend 2: PDF Export  │
                   │ + Email Reports        │
                   └────────────────────────┘


6. ADMIN DASHBOARD REDESIGN
   ┌────────────────────────────┐
   │ Backend 1: Admin Stats API  │
   │ (quick metrics)             │
   └──────────┬─────────────────┘
              │
   ┌──────────▼──────────────────────┐
   │ Frontend 2: Admin Layout        │
   │ + Sidebar + Quick Stats Cards   │
   │ + Organizer Role Support        │
   └──────────┬─────────────────────┘
              │
   ┌──────────▼──────────────────────┐
   │ Backend 1: Organizer Role       │
   │ Implementation + Access Control │
   └────────────────────────────────┘
```

---

## 📊 CRITICAL PATH

Shows which tasks must be done before others can proceed:

```
CRITICAL PATH (Longest dependency chain):

Day 1:
└─ Backend 1: Event model migration
   └─ Backend 1: Event endpoints
      └─ Frontend 1: Event CRUD UI

Day 2-3:
└─ Backend 2: Midtrans service setup
   └─ Backend 2: Payment initiation endpoint
      └─ Frontend 2: Midtrans Snap widget
         └─ Backend 2: Email system
            └─ Payment flow complete

Day 4-5:
└─ All core features done
   └─ Integration & testing
      └─ Polish & bug fixes
         └─ Ready for deployment
```

---

## 👥 COMMUNICATION PATHS

### Who talks to whom:

```
Frontend 1 ←→ Backend 1
  (Event CRUD)
  (Analytics queries)

Frontend 1 ←→ Backend 2
  (Analytics data)
  (PDF report generation)

Frontend 2 ←→ Backend 2
  (Payment initiation)
  (Payment status)

Frontend 2 ←→ Backend 1
  (Admin stats)
  (Quick metrics)

Frontend 1 ←→ Frontend 2
  (Admin UI consistency)
  (Component patterns)

Backend 1 ←→ Backend 2
  (Email notifications)
  (Order status updates)

All ←→ Project Lead
  (Blockers, escalations)
```

---

## 🚀 STARTUP SEQUENCE

### What must happen in order:

```
PHASE 1 - SETUP (Day 1, Morning)
1. Backend 1: Database migrations
2. Backend 2: Package installation & config
3. Frontend 1: Component setup
4. Frontend 2: Component setup

PHASE 2 - BACKEND READY (Day 1-2 Afternoon)
1. Backend 1: Event endpoints live
2. Backend 2: Payment initiation live
3. Backend 1: Admin notification system
4. Backend 2: Email job queued

PHASE 3 - FRONTEND INTEGRATION (Day 2-3)
1. Frontend 1: Pull event data from API
2. Frontend 2: Integrate with payment API
3. Both: Test with real data

PHASE 4 - DATA FLOW (Day 3-4)
1. Payment → Email → QR → User inbox
2. Event creation → Admin notification
3. Analytics → Charts → Dashboard

PHASE 5 - POLISH (Day 4-5)
1. UI consistency across all screens
2. Error handling & edge cases
3. Performance optimization

PHASE 6 - DEPLOYMENT (Day 5-6)
1. Code review complete
2. All tests passing
3. Documentation ready
```

---

## 📋 HANDOFF CHECKLIST

### What Frontend needs from Backend:

```
EVENT MANAGEMENT:
☐ GET  /api/events
☐ GET  /api/events/{id}
☐ POST /api/events (with starts_at, ends_at, poster_url)
☐ PUT  /api/events/{id}
☐ DELETE /api/events/{id} (with validation message)

PAYMENT:
☐ POST /api/payment/initiate (returns token)
☐ POST /api/payment/callback (webhook handling)
☐ GET  /api/orders/{id} (order status)

ANALYTICS:
☐ GET  /api/analytics/comparison
☐ GET  /api/analytics/revenue
☐ GET  /api/reports/generate
☐ POST /api/reports/export-pdf

ADMIN:
☐ GET  /api/admin/stats (quick metrics)
☐ GET  /api/auth/me (includes role)
```

### What Backend needs from Frontend:

```
PAYMENT FLOW:
✓ Payment confirmation page display
✓ Order ID & amount data
✓ Success/failed redirect

UI CONSISTENCY:
✓ Admin sidebar design
✓ Color palette & styling
✓ Component patterns

DATA VALIDATION:
✓ Form validation messages
✓ Error state displays
✓ Loading states
```

---

## 🎯 SYNCHRONIZATION POINTS

Required sync between frontend & backend:

```
DAY 1 - 09:00 AM
├─ Define API contracts
├─ Agree on response formats
├─ Setup mock data
└─ Both teams start with mocks

DAY 2 - 02:00 PM (before EOD)
├─ Backend: First API endpoints live
├─ Frontend: Start integration testing
├─ Both: Report blockers
└─ Adjust if needed

DAY 3 - 10:00 AM
├─ Check integration status
├─ Test payment flow manually
├─ Verify data flow end-to-end
└─ Identify issues early

DAY 4 - 04:00 PM
├─ All features should be working
├─ Start comprehensive testing
├─ Identify remaining bugs
└─ Estimate time to fix

DAY 5 - 09:00 AM
├─ Final integration testing
├─ Create test checklist
├─ Verify all requirements met
└─ Ready for submission
```

---

## ⚠️ COMMON INTEGRATION ISSUES

### Issue: Frontend waiting for Backend

```
Solution:
1. Frontend creates mock API file
2. Tests UI logic independently
3. Later, replace mock with real API
4. No blockers, parallel development

File: src/lib/mock-api.ts
const mockEvents = [
  { event_id: 1, name: 'Event 1', ... }
]
```

### Issue: Backend needs Frontend UI structure

```
Solution:
1. Frontend pushes component skeleton early
2. Backend reviews component props
3. Backend implements API to match expected props
4. Easy integration later

Example:
// Frontend component expects:
const AnalyticsDashboard = ({ 
  events: Event[] 
  metrics: Metric[]
})

// Backend creates API that returns exactly this
```

### Issue: Payment flow partially broken

```
Debugging steps:
1. Frontend: Check network tab, see what API returns
2. Frontend: Log payment response in console
3. Backend: Check Midtrans test transaction status
4. Backend: Verify callback URL is correct
5. Backend: Check webhook logs
```

---

## 📈 PROGRESS TRACKING

### Daily Progress Report Template:

```
DATE: [Date]
TEAM HEALTH: [Green ✅ / Yellow ⚠️ / Red 🔴]

FRONTEND 1:
├─ Yesterday completed: [%]
├─ Today completed: [%]
├─ Blockers: [None / List]
└─ Status: [On track / Behind / Ahead]

FRONTEND 2:
├─ Yesterday completed: [%]
├─ Today completed: [%]
├─ Blockers: [None / List]
└─ Status: [On track / Behind / Ahead]

BACKEND 1:
├─ Yesterday completed: [%]
├─ Today completed: [%]
├─ Blockers: [None / List]
└─ Status: [On track / Behind / Ahead]

BACKEND 2:
├─ Yesterday completed: [%]
├─ Today completed: [%]
├─ Blockers: [None / List]
└─ Status: [On track / Behind / Ahead]

CRITICAL ISSUES: [List any]
DEPENDENCIES BLOCKING: [List any]
NEXT SYNC: [Time]
```

---

## 🎓 KNOWLEDGE TRANSFER

### Repository Documentation:

After completion, create:

```
docs/
├─ ARCHITECTURE.md
│  └─ System design overview
├─ API_DOCUMENTATION.md
│  └─ All endpoints documented
├─ DATABASE_SCHEMA.md
│  └─ Table relationships
├─ FRONTEND_GUIDE.md
│  └─ Component usage
├─ BACKEND_GUIDE.md
│  └─ Service usage
└─ DEPLOYMENT.md
   └─ How to deploy
```

---

## ✨ SUCCESS INDICATORS

### Week 1 Goals:

```
By EOD Friday:
✅ All 13 requirements implemented
✅ All components properly integrated
✅ Payment flow tested & working
✅ Analytics displaying real data
✅ Admin notifications working
✅ No critical bugs
✅ Code reviewed & merged
✅ Ready for next phase (deployment)
```

### Code Quality Indicators:

```
✅ Zero console errors in production build
✅ TypeScript strict mode no errors
✅ All API responses properly typed
✅ Database queries optimized (<200ms)
✅ Frontend meets 90+ PageSpeed
✅ Mobile responsive 100%
✅ Test coverage >80%
```

---

## 🤝 Mutual Success Criteria

**For Frontend to succeed:**
- Backend provides stable, documented APIs
- Backend responds quickly to API issues
- Clear error messages from API

**For Backend to succeed:**
- Frontend tests APIs thoroughly
- Frontend provides exact data needs
- Frontend reports bugs with details

**For Team to succeed:**
- Communication is clear & timely
- Dependencies managed well
- Code review done thoroughly
- Blockers escalated immediately

---

Will print this file for:
- Team overview
- Reference during standups
- Dependency tracking
- Progress monitoring

🎯 **Keep this visible during development week!**
