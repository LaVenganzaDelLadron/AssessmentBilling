# Backend Connection Troubleshooting Guide

## Step 1: Check if Backend is Running

Open a terminal and check if Laravel is running on port 8000:

```bash
# Check if something is listening on port 8000
lsof -i :8000

# If you see something like: php ... (LISTEN)
# Then the backend is running ✅

# If nothing shows up, start your Laravel backend:
php artisan serve
```

## Step 2: Open Browser DevTools

1. Open your Angular app in browser
2. Press `F12` to open DevTools
3. Go to **Console** tab
4. Try logging in or registering
5. **Watch the console** for messages like:
   - `"Login form submitted"`
   - `"Form validation passed, sending login request..."`
   - Error messages

## Step 3: Check Network Request

1. In DevTools, go to **Network** tab
2. Try logging in
3. Look for request to `auth/login`
4. **Check the Response:**
   - If you see `"Cannot connect to backend..."`  → Backend is not running
   - If you see `"Server error"`  → Backend has an error
   - If you see validation errors → Check form data

## Step 4: Test Backend with cURL

Test if your backend is responding:

```bash
# Test if server is running at all
curl -I http://localhost:8000

# Test the register endpoint
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }' -v

# Test the login endpoint
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' -v
```

## Common Issues & Solutions

### Issue 1: "Cannot connect to backend. Is the server running on http://localhost:8000?"

**Problem:** Backend is not running or CORS is not configured

**Solution:**
```bash
# 1. Start Laravel backend
cd your-laravel-project
php artisan serve

# 2. If it runs on different port, update in frontend:
# File: src/app/features/auth/services/auth.service.ts
# Change: private apiUrl = 'http://localhost:8000/api';
# To: private apiUrl = 'http://your-ip:your-port/api';

# 3. Configure CORS in Laravel
# Edit: config/cors.php
# Add your frontend URL to allowed_origins:
'allowed_origins' => ['http://localhost:4200'],
'supports_credentials' => true,
```

### Issue 2: 422 Validation Errors

**Problem:** Form data doesn't match backend expectations

**Look for in error message:**
```
Email is already taken
Email must be a valid email address
Password must be at least 8 characters
```

**Solution:** Check that:
- Email format is correct
- Password is at least 8 characters
- Email is unique (not already in database)

### Issue 3: 401 Unauthorized After Login

**Problem:** Token is invalid or routes require auth

**Solution:**
```php
// In Laravel auth controller, ensure endpoint returns:
return response()->json([
    'token' => $token,
    'user' => [
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role
    ]
]);
```

### Issue 4: CORS Error in Browser Console

**Problem:** Backend is not configured to accept frontend requests

**Solution:**
```php
// config/cors.php
'paths' => ['api/*'],
'allowed_methods' => ['*'],
'allowed_origins' => ['*'],  // For development, use specific domain in production
'supports_credentials' => true,
```

### Issue 5: Forms Get Stuck Loading

**Problem:** Request hangs indefinitely

**Check:**
1. Backend never responds (network timeout)
2. Endpoint doesn't exist
3. CORS pre-flight (OPTIONS) request fails

**Debug:**
```javascript
// In browser console
// Check timeout by looking at network requests
// If OPTIONS request fails → CORS issue
// If no requests at all → other error
```

## Verify Backend Endpoints Exist

Your Laravel backend should have these routes:

```php
// routes/api.php
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});
```

## Quick Test: Use Mock Backend

To test frontend without backend, temporarily use this in `auth.service.ts`:

```typescript
login(credentials: LoginCredentials): Observable<AuthResponse> {
  // Temporary mock for testing
  console.log('Testing with mock response');
  return of({
    token: '1|test-token-12345',
    user: {
      id: 1,
      name: 'Test User',
      email: credentials.email,
      role: 'student'
    }
  }).pipe(
    delay(1000),  // Simulate network delay
    tap(response => {
      this.storeToken(response.token);
      this.currentUser.next(response.user!);
      this.userRole.next(response.user!.role);
      this.isAuthenticated.next(true);
      localStorage.setItem('user', JSON.stringify(response.user));
    })
  );
}
```

Don't forget to import `of` and `delay`:
```typescript
import { of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
```

## Debug Checklist

- [ ] Backend running on port 8000 (or correct port)
- [ ] CORS configured in Laravel
- [ ] Routes registered in Laravel (`/api/auth/register`, `/api/auth/login`)
- [ ] Controller methods implemented
- [ ] Database migrations run
- [ ] Users table exists
- [ ] No errors in Laravel logs
- [ ] No errors in browser console
- [ ] Network requests showing in DevTools Network tab
- [ ] Response has correct format with token and user

## Check Browser Console Logs

After clicking login/register, you should see:
```
Login form submitted
Form validation passed, sending login request...
```

Then either:
```
Login successful: { token: "...", user: {...} }
```

Or:
```
Login error: Error: Cannot connect to backend...
Auth Error: HttpErrorResponse { status: 0, statusText: 'Unknown Error' }
```

## Need More Help?

Share the error message from:
1. Browser Console (F12 → Console tab)
2. Laravel logs (`storage/logs/laravel.log`)
3. Network request details (F12 → Network tab → Select auth/login request)
