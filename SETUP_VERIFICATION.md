# Quick Setup & Verification Guide

## Backend URL Configuration ✅

Your frontend is now configured to use:
- **Development**: `http://127.0.0.1:8000/api`
- **Production**: `http://127.0.0.1:8000/api`

This matches your environment files.

## Before Testing

### 1. Ensure Laravel Backend is Running

```bash
cd your-laravel-project
php artisan serve
```

You should see:
```
Server running on [http://127.0.0.1:8000]
```

### 2. Verify Database is Set Up

```bash
cd your-laravel-project

# Run migrations
php artisan migrate

# Seed test data (optional)
php artisan db:seed
```

### 3. Ensure Auth Routes Exist

Your routes file shows these auth endpoints exist:
```
POST /api/auth/register
POST /api/auth/login
```

✅ These are configured correctly in your routes file.

### 4. Configure CORS (if needed)

If you get CORS errors, update `config/cors.php`:

```php
'paths' => ['api/*'],
'allowed_methods' => ['*'],
'allowed_origins' => ['http://127.0.0.1:4200', 'http://localhost:4200'],
'supports_credentials' => true,
```

### 5. Configure Sanctum

Update your `.env`:
```
SANCTUM_STATEFUL_DOMAINS=127.0.0.1:4200,localhost:4200
SESSION_DOMAIN=127.0.0.1
SESSION_SECURE_COOKIES=false
```

## Testing Steps

### Step 1: Start Angular App

```bash
cd your-angular-project
npm start
# Opens http://127.0.0.1:4200
```

### Step 2: Open Browser DevTools

Press `F12` to open DevTools and go to **Console** tab

### Step 3: Try Registration

1. Click "Register Student"
2. Fill the form:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm: `password123`
3. Click "Register Student"

### Step 4: Watch Console

You should see messages like:
```
Registration form submitted
Form validation passed, sending registration request...
Registration successful: { token: "...", user: {...} }
```

Then you'll be redirected to `/student` dashboard.

## If It Doesn't Work

### Check 1: Is Backend Running?

In DevTools Console, paste:
```javascript
fetch('http://127.0.0.1:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
})
.then(r => r.json())
.then(d => console.log(d))
.catch(e => console.error(e))
```

If backend is running, you'll see a response. If not, you'll see an error.

### Check 2: Network Tab

In DevTools, go to **Network** tab:
1. Try logging in
2. Look for request to `auth/login`
3. Check the **Response** tab for the backend response

If the request never appears → backend not running  
If request shows 0 status → CORS issue  
If request shows 404 → route doesn't exist  
If request shows 422 → validation error  
If request shows 500 → server error (check Laravel logs)

### Check 3: Laravel Logs

In your Laravel project:
```bash
tail -f storage/logs/laravel.log
```

Try logging in and watch for errors.

### Check 4: Database

Verify the users table exists:
```bash
php artisan tinker
>>> DB::table('users')->count()
```

Should return a number (count of users).

## API Response Format

Your AuthController must return responses in this format:

### Register Success (200)
```json
{
  "token": "1|abc123def456...",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "role": "student"
  }
}
```

### Login Success (200)
```json
{
  "token": "1|xyz789abc123...",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "role": "student"
  }
}
```

### Validation Error (422)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Cannot connect to backend" | Backend not running | Start Laravel: `php artisan serve` |
| CORS error in console | CORS not configured | Update `config/cors.php` |
| 404 error | Route not found | Verify routes are registered |
| 422 error | Validation failed | Check form data matches validation rules |
| 500 error | Server error | Check `storage/logs/laravel.log` |
| Stuck loading | Request hanging | Check backend is responding, not timing out |

## Your Routes

These are the auth endpoints defined in your routes file:

```php
Route::prefix('auth')->controller(AuthController::class)->group(function () {
    Route::post('/register', 'register');    // POST /api/auth/register
    Route::post('/login', 'login');          // POST /api/auth/login
});

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();                // GET /api/user
});

Route::middleware(['auth:sanctum'])->prefix('user')->controller(AuthController::class)->group(function () {
    Route::post('/logout', 'logout');       // POST /api/user/logout
});
```

All these endpoints are public or protected as intended. ✅

## Success Indicators

After successful registration or login:

✅ Console shows "Login successful" or "Registration successful"  
✅ User data stored in localStorage:
```javascript
// In DevTools Console:
localStorage.getItem('auth_token')   // Shows token
localStorage.getItem('user')         // Shows user data
```

✅ Redirected to student dashboard (`/student`)  
✅ Sidebar visible with student menu items

## Next Steps

1. Implement AuthController methods:
   - `register()` - Create user and return token
   - `login()` - Validate credentials and return token
   - `logout()` - Revoke token

2. Each should return the response format shown above

3. Ensure database migrations create users table with:
   - id, name, email, password, role, created_at, updated_at

Once backend is implemented, everything should work! 🚀
