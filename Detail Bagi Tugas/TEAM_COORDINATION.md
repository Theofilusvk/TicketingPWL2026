# 📅 DAILY STANDUP & TEAM COORDINATION GUIDE

---

## 🎯 DAILY STANDUP FORMAT (15 minutes)

**Time:** 09:00 AM setiap hari  
**Location:** Meeting room / Zoom link  
**Participants:** Semua 4 developer + Project Lead

### Standup Template untuk Setiap Developer

```
Nama: [Name]
Role: [Frontend 1 / Frontend 2 / Backend 1 / Backend 2]

✅ YESTERDAY (Yesterday's Progress)
- Completed: [Task 1, Task 2]
- Hours spent: [X hours]

🔄 TODAY (Today's Plan)
- Will work on: [Task 1, Task 2]
- Expected to complete: [Task X by EOD]

🚧 BLOCKERS (Hambatan)
- Waiting for: [Backend API, Design review, etc]
- Need help with: [Specific issue if any]

📊 PROGRESS (Daily % toward deliverables)
- Frontend 1: 20% → 25% (5% progress)
- Frontend 2: 15% → 20% (5% progress)
- Backend 1: 25% → 30% (5% progress)
- Backend 2: 10% → 15% (5% progress)
```

---

## 🔗 DAILY TASK CHECKLIST

### Before Standup (08:45 AM):
- [ ] Pull latest changes dari repository
- [ ] Test your code locally
- [ ] Update JIRA/Trello dengan progress
- [ ] Note down blockers atau issues

### During Standup (09:00 - 09:15 AM):
- [ ] Share screen untuk demo jika ada
- [ ] Discuss blockers dengan tim
- [ ] Clarify API contracts jika perlu
- [ ] Coordinate dependencies

### After Standup (Segera):
- [ ] Start work on today's tasks
- [ ] Communicate dengan team member yang dependent
- [ ] Push code harian (minimum 1 commit)

---

## 📌 API CONTRACT DEFINITION

### Who Responsible?
- **Backend 1**: Define event-related endpoints
- **Backend 2**: Define payment & analytics endpoints
- **Frontend 1 & 2**: Consume & test endpoints

### Process:
1. Backend creates API spec (swagger/postman)
2. Frontend reviews & gives feedback
3. Backend implements
4. Frontend integrates & tests
5. Both verify together

### Format Template:

```
POST /api/events
├─ Purpose: Create new event
├─ Auth: Required (admin/organizer only)
├─ Request Body:
│  {
│    "name": "string (required)",
│    "description": "string (nullable)",
│    "starts_at": "datetime (YYYY-MM-DD HH:mm)",
│    "ends_at": "datetime (YYYY-MM-DD HH:mm)",
│    "location": "string (required)",
│    "capacity": "integer (min 10)",
│    "poster_url": "url (nullable)"
│  }
├─ Response (201):
│  {
│    "status": "success",
│    "data": { event object }
│  }
├─ Errors:
│  - 422: Validation error
│  - 401: Unauthorized
│  - 403: Not admin/organizer
└─ Tested: ✅ Yes / ❌ No
```

---

## 🔄 GIT WORKFLOW

### Branch Naming Convention
```
feat/[task-name]          # New feature
fix/[task-name]           # Bug fix
refactor/[task-name]      # Code refactoring
docs/[task-name]          # Documentation
test/[task-name]          # Testing

Examples:
feat/event-crud-with-poster
feat/admin-analytics-dashboard
feat/midtrans-payment-integration
fix/profile-autofill-validation
```

### Daily Workflow:
```bash
# Start day
git checkout develop
git pull origin develop

# Create feature branch (if not done yet)
git checkout -b feat/your-task-name

# Work & commit regularly
git add .
git commit -m "feat: [task] - [what you did]"
git commit -m "fix: [task] - [bug fixed]"

# End of day - push & create PR
git push origin feat/your-task-name

# In GitHub/GitLab: Create Pull Request
# - Link to JIRA ticket
# - Add description of changes
# - Request review from team lead or peer
```

### Commit Message Style:
```
feat: Add event CRUD with poster preview
       - Add modal for event details
       - Implement poster upload & preview
       - Add date range picker
       - Add delete validation

Closes: #123
Related: JIRA-456
```

---

## 📱 TEAM COMMUNICATION CHANNELS

### Slack / Discord Channel Structure:
```
#general               General announcements
#standup              Daily standup notes
#frontend-dev         Frontend 1 & 2 chat
#backend-dev          Backend 1 & 2 chat
#blockers              🚨 Issues & problems
#code-review          Pull requests & feedback
#deployment           Release & deployment updates
```

### Response Time SLA:
- Blocker questions: **15 minutes**
- Code review requests: **1 hour**
- General questions: **3 hours**
- Non-urgent messages: **EOD**

---

## 🚨 BLOCKER RESOLUTION PROCESS

1. **Identify**: Recognize immediately
   ```
   "BLOCKER: Frontend can't start payment because API endpoint not ready"
   ```

2. **Report**: Post in #blockers channel with:
   ```
   Title: [BLOCKED] Payment Integration
   Who's blocked: Frontend Person 2
   Depends on: Backend Person 2 (PaymentController endpoint)
   Expected fix time: 2 hours
   ```

3. **Alternative**: Find workaround while waiting
   ```
   Frontend: Create mock API response file
   Continue UI development independently
   ```

4. **Escalate**: If blocking for >2 hours, escalate to Project Lead

5. **Resolve**: Update channel when fixed
   ```
   "✅ RESOLVED: Payment API endpoint ready at /api/payment/initiate"
   ```

---

## 📊 PROGRESS TRACKING

### Weekly Goals (7 days)

**Day 1-2: Setup**
```
Frontend 1: Component skeleton ready, Recharts configured
Frontend 2: CheckoutPage enhanced structure
Backend 1: Migrations created, Event model updated
Backend 2: Midtrans service initialized, configs set
```

**Day 3-4: Core Implementation**
```
Frontend 1: Analytics dashboard 80% complete
Frontend 2: Midtrans widget 90% complete
Backend 1: Registration logic done, notifications 80%
Backend 2: Email system done, analytics 60%
```

**Day 5-6: Polish & Testing**
```
Frontend 1: Admin UI redesign complete, PDF export done
Frontend 2: All components integrated & tested
Backend 1: All endpoints tested & documented
Backend 2: All services optimized, caching done
```

**Day 7: Finalization**
```
All: Code review complete
All: Testing complete
All: Documentation complete
All: Ready for deployment
```

### JIRA Ticket Status Flow:
```
BACKLOG → IN PROGRESS → CODE REVIEW → TESTING → DONE
```

---

## 🎯 TEST CHECKLIST BEFORE SUBMISSION

### For Every Feature:

```
FRONTEND CHECKLIST:
- [ ] UI renders without errors
- [ ] Responsive on mobile/tablet/desktop
- [ ] All form validations work
- [ ] Error messages display correctly
- [ ] Loading states show
- [ ] Error states handled gracefully
- [ ] Accessibility check (keyboard nav, screen reader)
- [ ] Performance: No console errors
- [ ] Connected to correct backend endpoint

BACKEND CHECKLIST:
- [ ] All validations working
- [ ] Error responses formatted correctly
- [ ] Authorization checks in place
- [ ] Database queries optimized (check N+1)
- [ ] Test with Postman/curl
- [ ] All edge cases handled
- [ ] Token/Auth working correctly
- [ ] Response codes correct (201, 400, 401, 403, etc)
- [ ] Documentation complete

INTEGRATION CHECKLIST:
- [ ] Frontend + Backend working together
- [ ] Mock data removed, using real API
- [ ] Tested in staging/dev environment
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Performance tested with realistic data
- [ ] Security check (no sensitive data in logs)
```

---

## 📝 CODE REVIEW GUIDELINES

### Before Requesting Review:
```
- [ ] Code is complete & tested locally
- [ ] No console warnings/errors
- [ ] Follows team code style
- [ ] Variable names are clear
- [ ] Comments added for complex logic
- [ ] Commits are logical & atomic
- [ ] PR description is detailed
```

### Reviewer Checklist:
```
- [ ] Code is readable & understandable
- [ ] Follows established patterns & conventions
- [ ] No obvious bugs or security issues
- [ ] Tests are adequate (if applicable)
- [ ] Performance impact considered
- [ ] Backward compatibility maintained
- [ ] Approves or requests specific changes
```

### Comment Style:
```
✅ Good:
"I like how you handled the error case here. 
Consider adding a retry mechanism for better UX."

❌ Avoid:
"This is wrong. Fix it."

Instead use:
"Could this potentially cause issues if X happens?
Why did you choose this approach over Y?"
```

---

## 🎓 KNOWLEDGE SHARING

### End of Day Knowledge Share (15 min, Fridays 4 PM):

**Schedule:**
```
Week 1-2:
Fri 4pm: Backend explains Midtrans integration challenge

Week 3-4:
Fri 4pm: Frontend explains analytics chart implementation

Week 5-6:
Fri 4pm: Team discusses gotchas & lessons learned
```

**Format:**
- 10 min: What we learned
- 3 min: Q&A
- 2 min: Tips for team

---

## 🔐 CODE STYLE & STANDARDS

### TypeScript/React:
```typescript
// File structure
import { useState } from 'react'
import { Component } from './components/Component'

// Components
export function MyComponent() {
  // ...
}

// Naming
const camelCaseVariables = 'good'
const PascalCaseComponents = true
const UPPERCASE_CONSTANTS = 'good'
```

### PHP/Laravel:
```php
// PSR-12 standard
namespace App\Http\Controllers;

class MyController extends Controller
{
    public function index()
    {
        // ...
    }
}

// Naming
$camelCaseVariables = 'good';
class PascalCaseClasses {}
const UPPERCASE_CONSTANTS = true;
```

### Git Commits:
```
✓ Good:
  feat: Add event analytics dashboard
  fix: Handle null poster_url in event display
  refactor: Simplify payment processing logic

✗ Bad:
  update code
  fixes
  asdsad
```

---

## 📞 ESCALATION PROCESS

### Level 1: Team Member Help (15 min response)
```
Ask in #general or direct message to teammate
"Hey, having issue with X. Can you help?"
```

### Level 2: Technical Lead Review (1 hour response)
```
Post in #blockers
"Need help with architecture decision on X"
"Can you review my approach to Y?"
```

### Level 3: Project Manager (EOD response)
```
"Feature X scope unclear, need clarification"
"Blocked on dependency, need to adjust timeline"
```

---

## ✨ TIPS FOR SUCCESS

1. **Communicate Early & Often**
   - Don't wait until it's a problem
   - Ask for clarification immediately

2. **Push Code Daily**
   - Minimum 1 commit per day
   - Easy to track progress

3. **Test Before Committing**
   - Run tests locally
   - Check for console errors

4. **Document as You Go**
   - Add comments for complex logic
   - Update README/docs

5. **Help Each Other**
   - Code review takes time but catches bugs
   - Pair programming if someone is stuck

6. **Celebrate Wins**
   - When features are complete, acknowledge
   - Share success in #general

---

## 📋 COMMON ISSUES & FIXES

### "API not working from Frontend"
1. Check CORS configuration
2. Verify auth token is being sent
3. Check network tab in DevTools
4. Verify endpoint path matches
5. Test with Postman first

### "Database migration fails"
1. Check SQL syntax
2. Verify table/column names
3. Check for existing migrations
4. Run `php artisan migrate:status`
5. Rollback and retry

### "Component not rendering"
1. Check console for errors
2. Verify props are passed correctly
3. Use React DevTools to inspect
4. Check CSS classes
5. Verify imports are correct

### "Payment flow broken"
1. Check Midtrans credentials
2. Verify order amount is correct
3. Check email format
4. Test with Postman mock
5. Check payment callback handling

---

**Good luck team! 🚀**
