# Fix Auth Network Error - Dynamic Error Messages

## Plan Overview
Update auth.service.ts handleError() to use dynamic apiUrl in error messages instead of hardcoded localhost:8000.

## Steps
- [x] Step 1: Edit src/app/features/auth/services/auth.service.ts - Replace hardcoded error messages with dynamic ones using `this.apiUrl`
- [ ] Step 2: Test login functionality in development
- [ ] Step 3: Verify error messages show correct backend URL
- [ ] Step 4: Complete task

Current progress: Starting Step 1
