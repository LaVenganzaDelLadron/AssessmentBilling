# 🧪 Admin Panel Testing & Verification Guide

## Prerequisites
1. ✅ Angular app built: `ng build --configuration development` 
2. ⏳ **REQUIRED:** Start Laravel backend: `php artisan serve --host=localhost --port=8000`
3. ⏳ **REQUIRED:** Ensure database migrations are complete

---

## 🚀 Quick Start Testing

### 1. Start Dev Server
```bash
cd /home/argus/Documents/small_project/AssessmentBilling
ng serve --configuration development --open
```
This opens the app at `http://localhost:4200`

### 2. Navigate to Admin Dashboard
```
http://localhost:4200/admin/dashboard
```

### 3. Expected Dashboard Display
- **Loading Phase:** Animated spinner for 1-2 seconds
- **Success State:** 6 stat cards with real data
  - Total Revenue: Formatted USD amount
  - Pending Payments: Formatted USD amount
  - Overdue: Red-highlighted USD amount
  - Paid This Month: Formatted USD amount
  - Students: Total count
  - Assessments: Total count
- **Recent Invoices Table:** Last 2 invoices with status badges
- **Assessment Summary:** Percentage breakdown

---

## ✅ Dashboard Verification Checklist

### Data Loading
- [ ] No console errors when page loads
- [ ] Stat cards populate with numbers (not 0 or undefined)
- [ ] Recent invoices table shows at least 1 row
- [ ] Date formatting shows as "MMM dd, yyyy" (e.g., "Apr 17, 2024")

### Error Handling
- [ ] Stop Laravel backend
- [ ] Refresh page
- [ ] Verify error message displays: "Failed to load dashboard statistics"
- [ ] Verify fallback stat cards show default values (0s)
- [ ] Start Laravel backend again
- [ ] Verify dashboard recovers and shows real data

### Responsive Design
- [ ] Desktop (1024px+): 6 stat cards in single row
- [ ] Tablet (768px): 3 stat cards per row
- [ ] Mobile (320px): 1-2 stat cards per row
- [ ] Recent data section stacks vertically on mobile

### Formatting
- [ ] Currency values show $ prefix: e.g., "$5,234.50"
- [ ] Status badges use correct colors:
  - Paid → Green background with "paid" text
  - Pending → Amber background with "pending" text
  - Overdue → Red background with "overdue" text

---

## 🔄 CRUD Operations Testing

### Academic Terms Module
**Route:** `http://localhost:4200/admin/academic-terms`

**Test Case 1: Create**
- [ ] Click "Add Academic Term" button
- [ ] Fill form: School Year (e.g., "2024-2025"), Semester (1-4), dates
- [ ] Click Submit
- [ ] Verify success message displays
- [ ] Verify new row appears in table
- [ ] Verify API call in Network tab shows POST to `/api/admin/academic-terms`

**Test Case 2: Update**
- [ ] Click "Edit" icon on a row
- [ ] Change school year field
- [ ] Click Submit
- [ ] Verify success message
- [ ] Verify table updated
- [ ] Verify API call shows PUT to `/api/admin/academic-terms/:id`

**Test Case 3: Delete**
- [ ] Click "Delete" icon on a row
- [ ] Confirm deletion
- [ ] Verify row removed from table
- [ ] Verify API call shows DELETE to `/api/admin/academic-terms/:id`

**Test Case 4: Search Filter**
- [ ] Type text in search field
- [ ] Verify table filters in real-time
- [ ] Clear search, verify all rows show

### Invoices Module
**Route:** `http://localhost:4200/admin/invoices`

**Test Case 1: Load & Filter**
- [ ] Page loads with invoices list
- [ ] Status filter dropdown works (select "paid", "pending", etc.)
- [ ] Table filters immediately
- [ ] Search by invoice number works

**Test Case 2: Create Invoice**
- [ ] Click "Add Invoice" button
- [ ] Fill: Student ID, Assessment ID, Invoice #, Amount, Due Date
- [ ] Submit
- [ ] Verify in table with "pending" status

**Test Case 3: Update Invoice Status**
- [ ] Edit an invoice
- [ ] Change status to "paid"
- [ ] Submit
- [ ] Verify status badge color changes to green

**Test Case 4: Status Badge Colors**
- [ ] Paid invoices → Green badge
- [ ] Pending invoices → Amber badge
- [ ] Overdue invoices → Red badge
- [ ] Cancelled invoices → Gray badge

### Payments Module
**Route:** `http://localhost:4200/admin/payment`

**Test Case 1: Create Payment**
- [ ] Click "Add Payment"
- [ ] Select invoice from dropdown
- [ ] Enter amount, reference number, payment method
- [ ] Submit
- [ ] Verify in table

**Test Case 2: Payment Methods Mapping**
- [ ] Verify payment methods display correctly:
  1 = Cash, 2 = Credit/Debit Card, 3 = Check, 4 = Bank Transfer, 5 = Online Payment, 6 = Other

### Refunds Module
**Route:** `http://localhost:4200/admin/refunds`

**Test Case 1-3:** Repeat same tests as Invoices (Create, Update, Delete)

---

## 🛡️ Error Scenario Testing

### Scenario 1: Network Error
**Setup:**
1. Open DevTools Network tab
2. Set throttling to "Offline"

**Test:**
- [ ] Page shows error message
- [ ] No JavaScript exceptions
- [ ] Error is user-friendly (not raw error code)

### Scenario 2: 401 Unauthorized
**Setup:**
1. Open DevTools → Storage → Cookies
2. Delete Sanctum token

**Test:**
- [ ] Page shows 401 error or redirects to login
- [ ] User is logged out properly

### Scenario 3: Validation Error
**Test:**
- [ ] Try to create invoice without required fields
- [ ] Verify form validation prevents submission
- [ ] Or if submitted, show backend error message

### Scenario 4: 404 Not Found
**Setup:**
1. Manually edit invoice ID to non-existent (edit URL)

**Test:**
- [ ] Shows "Resource not found" error
- [ ] Doesn't crash app

### Scenario 5: 500 Server Error
**Setup:**
1. Break Laravel route temporarily
2. Try to load page

**Test:**
- [ ] Shows "Server error" message
- [ ] User can retry without page reload

---

## 📊 API Endpoint Verification

### Verify All Endpoints Use `/admin/` Prefix

**In DevTools Network tab, look for these requests:**

✅ **Dashboard:** `GET /api/admin/dashboard`
```json
{
  "totalRevenue": 50000,
  "pendingPayments": 5000,
  "overdueAmount": 2500,
  "paidThisMonth": 10000,
  "totalStudents": 150,
  "activeStudents": 145,
  "assessments": 12
}
```

✅ **List Invoices:** `GET /api/admin/invoices`
```json
[
  {
    "id": 1,
    "invoice_number": "INV-2024-001",
    "student_id": 1,
    "total_amount": 5000,
    "status": "paid"
  }
]
```

✅ **Create Invoice:** `POST /api/admin/invoices`
**Request Body:**
```json
{
  "student_id": 1,
  "assessment_id": 1,
  "invoice_number": "INV-2024-002",
  "total_amount": 5000,
  "balance": 5000,
  "due_date": "2024-05-17",
  "status": "pending"
}
```

✅ **Update Invoice:** `PUT /api/admin/invoices/1`
```json
{
  "status": "paid",
  "balance": 0
}
```

✅ **Delete Invoice:** `DELETE /api/admin/invoices/1`

### Verify Headers
Every request should include:
- `Authorization: Bearer {sanctum_token}`
- `Content-Type: application/json`
- `Accept: application/json`

---

## 🎨 UI/UX Verification

### Visual Consistency
- [ ] All stat cards use same styling
- [ ] All tables have consistent header formatting
- [ ] All modals use same size and positioning
- [ ] Status badges consistent across all pages
- [ ] Loading spinners identical across app

### Accessibility
- [ ] Tab navigation works through form inputs
- [ ] Focus states visible
- [ ] Error messages visible and readable
- [ ] Colors have sufficient contrast (WCAG AA standard)

### Performance
- [ ] Dashboard loads within 2 seconds
- [ ] Table pagination (if any) responsive
- [ ] No memory leaks on component destroy
- [ ] Modal open/close smooth

---

## 📱 Browser & Device Testing

### Desktop Browsers
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if Mac available)
- [ ] Edge

### Responsive Viewports
- [ ] Mobile: 320px (iPhone SE)
- [ ] Tablet: 768px (iPad)
- [ ] Desktop: 1024px+

### Mobile Devices (if possible)
- [ ] Real iPhone
- [ ] Real Android device
- [ ] Verify touch interactions work

---

## 🔗 Integration Testing

### Test Full User Flow
1. **Login** → Admin routes protected by auth guard
2. **Navigate Dashboard** → Load statistics
3. **Create Invoice** → Add through modal, verify in table
4. **Update Invoice** → Edit status, verify changes
5. **Delete Invoice** → Remove, verify deletion
6. **Filter & Search** → Test search functionality
7. **Navigate Between Pages** → Test routing
8. **Logout** → Verify session cleanup

---

## 📋 Sign-Off Checklist

When all tests pass, check these boxes:

### Functionality ✅
- [ ] Dashboard displays correct statistics
- [ ] All CRUD operations work (Create, Read, Update, Delete)
- [ ] Search and filtering work correctly
- [ ] Error messages display properly
- [ ] Loading states show during API calls

### Design ✅
- [ ] Responsive on all screen sizes
- [ ] Colors match design system
- [ ] Fonts are readable
- [ ] Spacing is consistent
- [ ] Icons display correctly

### Performance ✅
- [ ] Dashboard loads in < 3 seconds
- [ ] CRUD operations submit in < 2 seconds
- [ ] No console errors or warnings
- [ ] No memory leaks (check DevTools)

### Security ✅
- [ ] Authorization token required
- [ ] Unauthorized users cannot access
- [ ] CORS headers configured correctly
- [ ] No sensitive data in console logs

### Documentation ✅
- [ ] Code comments explain logic
- [ ] README updated with setup steps
- [ ] Error messages are user-friendly

---

## 🐛 If Tests Fail

### Common Issues & Solutions

**Dashboard shows "Failed to load statistics"**
```bash
# Check Laravel is running
curl http://localhost:8000/api/admin/dashboard -H "Authorization: Bearer {token}"

# Check token in auth interceptor
# Look in Network tab → Response headers for error details
```

**Modal doesn't close after submit**
```bash
# Check browser console for JavaScript errors
# Verify API returned success response
# Check modal.close() method is being called
```

**Form validation fails**
```bash
# Check required fields are filled
# Compare with backend validation rules
# Verify data types match (e.g., number vs string)
```

**CORS error**
```bash
# Check Laravel has CORS enabled
# Verify localhost:4200 is in allowed origins
# In .env: SANCTUM_STATEFUL_DOMAINS=localhost:4200
```

**401 Unauthorized**
```bash
# Token expired or invalid
# Need to login again
# Check token in DevTools → Application → Cookies
```

---

## 📞 Next Steps After Verification

1. **Performance Optimization**
   - Add pagination for large datasets
   - Implement caching where appropriate
   - Lazy-load images and components

2. **Enhanced UX**
   - Toast notifications for CRUD feedback
   - Confirmation dialogs for destructive actions
   - Optimistic updates (UI updates before API response)

3. **Additional Features**
   - Advanced filtering with date ranges
   - Export to CSV/PDF
   - Bulk operations (multi-select, delete many)
   - User activity logging

4. **Production Deployment**
   - Set `production: true` in environment
   - Run `ng build` (production build)
   - Configure backend URL for production
   - Set up CI/CD pipeline
   - Deploy to hosting platform
