# Complete Authentication Flow Example

## What Changed

Your Angular frontend is now fully integrated with your Laravel backend for authentication. Instead of simulating login with localStorage, the frontend now makes real HTTP requests to your backend endpoints.

## Key Features

✅ **Real HTTP Communication**: Login and register endpoints call your Laravel backend
✅ **Token-Based Authentication**: Uses Laravel Sanctum tokens stored in localStorage  
✅ **Automatic Token Injection**: All HTTP requests include the Bearer token
✅ **Role-Based Access**: Admin/Teacher/Student portals protected by role guards
✅ **Error Handling**: Validation errors, rate limiting, and auth errors displayed
✅ **Automatic Logout**: 401 errors trigger logout and redirect to login
✅ **Form Validation**: Client-side validation before sending to backend

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Angular Frontend                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────┐                                    │
│  │  Login/Register      │                                    │
│  │  Components          │                                    │
│  └──────────┬───────────┘                                    │
│             │ (calls)                                        │
│  ┌──────────▼───────────┐                                    │
│  │  AuthService         │                                    │
│  │  • login()           │                                    │
│  │  • register()        │                                    │
│  │  • logout()          │                                    │
│  └──────────┬───────────┘                                    │
│             │ (HTTP POST/GET)                               │
│  ┌──────────▼───────────┐      ┌──────────────────┐         │
│  │  HTTP Interceptors  ├─────>│  AuthInterceptor │         │
│  │  • AuthInterceptor  │      │  • Adds token    │         │
│  │  • ErrorInterceptor │      │  • Sets headers  │         │
│  └──────────┬───────────┘      └──────────────────┘         │
│             │                                                │
│  ┌──────────▼───────────┐      ┌──────────────────┐         │
│  │  Route Guards       │      │  ErrorInterceptor│         │
│  │  • AdminGuard       │      │  • Handles 401   │         │
│  │  • TeacherGuard     │      │  • Logs out user │         │
│  │  • StudentGuard     │      │  • Redirects     │         │
│  └─────────────────────┘      └──────────────────┘         │
│                                                               │
└─────────────────────┬──────────────────────────────────────┘
                      │ HTTPS
                      │
              ┌───────▼────────┐
              │  Laravel API   │
              │  Backend       │
              │                │
              │ /api/auth/login│
              │ /api/auth/register
              │ /api/user      │
              │ /api/auth/*    │
              └────────────────┘
```

## Step-by-Step Flow Examples

### 1. Registration Flow

#### User Interface
```
┌─ Registration Page ─────────────────────┐
│                                          │
│  Name: [John Doe________________]       │
│  Email: [john@example.com______]        │
│  Password: [••••••••__________]         │
│  Confirm: [••••••••__________]          │
│                                          │
│  [Register Student]                     │
└──────────────────────────────────────────┘
```

#### Code Execution Path

**1. User clicks "Register Student"**
```typescript
// register.ts
onSignup() {
  // Client validates form
  if (!this.registerForm.name.trim()) {
    this.fieldErrors['name'] = 'Name is required';
    return;
  }
  // ... more validation ...
  
  // Make HTTP request
  this.authService.register({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  }).subscribe({
    next: (response) => {
      this.successMessage = 'Registration successful!';
      setTimeout(() => {
        this.router.navigate(['/student']);
      }, 1000);
    },
    error: (error) => {
      this.errorMessage = error.message;
    }
  });
}
```

**2. AuthService makes HTTP request**
```typescript
// auth.service.ts
register(data: RegisterData): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(
    'http://localhost:8000/api/auth/register',
    data  // { name, email, password }
  ).pipe(
    tap(response => {
      if (response.token) {
        this.storeToken(response.token);
        this.currentUser.next(response.user);
        this.userRole.next(response.user.role);
      }
    }),
    catchError(this.handleError)
  );
}
```

**3. AuthInterceptor adds token**
```typescript
// auth.interceptor.ts
intercept(request, next) {
  const token = this.authService.getToken();
  
  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
  }
  
  return next.handle(request);
}
```

**4. Backend Response (from Laravel)**
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "token": "1|abc123def456xyz789abc123def456",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

**5. AuthService stores data**
```typescript
// LocalStorage now contains:
{
  "auth_token": "1|abc123def456xyz789abc123def456",
  "user": "{\"id\":1,\"name\":\"John Doe\",\"email\":\"john@example.com\",\"role\":\"student\"}"
}

// BehaviorSubjects updated:
isAuthenticated$ = true
userRole$ = 'student'
currentUser$ = { id: 1, name: 'John Doe', ... }
```

**6. User redirected to student dashboard**
```
/student → StudentLayoutComponent
           ├── Sidebar (green theme)
           └── Dashboard page
```

### 2. Login Flow

#### HTML Template
```html
<form (ngSubmit)="onSubmit()">
  <input 
    type="email"
    [(ngModel)]="loginForm.email"
    placeholder="john@example.com"
    [disabled]="isLoading">
  
  <input 
    type="password"
    [(ngModel)]="loginForm.password"
    placeholder="••••••••"
    [disabled]="isLoading">
  
  <button [disabled]="isLoading">
    {{ isLoading ? 'Signing In...' : 'Sign In' }}
  </button>
</form>

<div *ngIf="errorMessage" class="error">
  {{ errorMessage }}
</div>
```

#### Component Logic
```typescript
// login.ts
onSubmit() {
  this.errorMessage = '';
  this.successMessage = '';
  
  // Validate form
  if (!this.loginForm.email || !this.loginForm.password) {
    this.errorMessage = 'Email and password are required';
    return;
  }
  
  if (this.loginForm.password.length < 8) {
    this.errorMessage = 'Password must be at least 8 characters';
    return;
  }
  
  this.isLoading = true;
  
  // Call backend
  this.authService.login({
    email: this.loginForm.email,
    password: this.loginForm.password,
    remember: this.loginForm.remember
  }).subscribe({
    next: (response) => {
      this.successMessage = 'Login successful!';
      this.isLoading = false;
      
      // Get role from response
      const role = response.user?.role || 'student';
      
      // Navigate to appropriate portal
      const routeMap = {
        admin: '/admin',
        teacher: '/teacher',
        student: '/student'
      };
      
      setTimeout(() => {
        this.router.navigate([routeMap[role]]);
      }, 500);
    },
    error: (error) => {
      this.isLoading = false;
      this.errorMessage = error.message;
    }
  });
}
```

#### Backend Response Examples

**Success (Admin Login)**
```json
{
  "token": "1|xyz789abc123def456xyz789abc123",
  "user": {
    "id": 3,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```
→ Redirects to `/admin` dashboard

**Success (Teacher Login)**
```json
{
  "token": "1|teacher_token_here",
  "user": {
    "id": 2,
    "name": "Ms. Johnson",
    "email": "teacher@example.com",
    "role": "teacher"
  }
}
```
→ Redirects to `/teacher` dashboard

**Rate Limited Error (429)**
```json
{
  "message": "Too many login attempts. Please try again in 120 seconds."
}
```
→ Shows error: "Too many login attempts. Please try again later."

**Validation Error (422)**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```
→ Extracted and displayed in form

**Invalid Credentials (401)**
```json
{
  "message": "Invalid credentials"
}
```
→ Shows error message

### 3. Protected Route Access

#### User tries to access `/admin` when logged in as student

**Route Configuration**
```typescript
// app.routes.ts
{
  path: 'admin',
  canActivate: [AdminGuard],  // Guard checks role
  loadChildren: () => import('./features/admin/admin.route')
}
```

**Guard Execution**
```typescript
// AdminGuard
canActivate(route, state) {
  if (this.authService.isLoggedIn() && 
      this.authService.hasRole('admin')) {
    return true;  // Allow access
  }
  return this.router.parseUrl('/login');  // Redirect to login
}
```

**AuthService State**
```typescript
isLoggedIn() {
  return this.hasToken() && this.isAuthenticated.value;
  // Checks: localStorage has 'auth_token' && BehaviorSubject is true
}

hasRole('admin') {
  return this.userRole.value === 'admin';
  // Checks: stored userRole is 'admin'
}
```

**Result**: Student redirected to home page (`/`)

### 4. Token Refresh on Page Reload

#### Page is refreshed with existing token

```typescript
// auth.service.ts constructor
constructor(private http: HttpClient) {
  this.loadAuthState();
}

private loadAuthState(): void {
  // Check if token exists in localStorage
  if (this.hasToken()) {
    // Retrieve user data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      
      // Restore state
      this.currentUser.next(user);
      this.userRole.next(user.role);
      this.isAuthenticated.next(true);
      
      // User is now logged in without re-authenticating
    }
  }
}
```

**Timeline**:
1. User refreshes page at `/admin`
2. Angular bootstraps
3. AuthService constructor calls `loadAuthState()`
4. Token and user data restored from localStorage
5. AuthService marks user as authenticated
6. AdminGuard checks `isLoggedIn()` and `hasRole('admin')`
7. Both return true → page loads normally

### 5. Logout Flow

#### User clicks logout button

```typescript
// Any component (e.g., header, sidebar)
logout() {
  this.authService.logout();
  this.router.navigate(['/login']);
}
```

**AuthService clears everything**
```typescript
logout(): void {
  this.removeToken();                    // Remove 'auth_token' from localStorage
  this.currentUser.next(null);           // Clear user
  this.userRole.next('guest');           // Reset role
  this.isAuthenticated.next(false);      // Mark as not authenticated
  localStorage.removeItem('user');       // Remove user data
}
```

**Result**:
- All tokens cleared
- All state reset
- User redirected to login page
- Guards will now redirect any protected routes to login

### 6. Automatic Logout on 401

#### User's token expired or was revoked

**API Request**
```
GET /api/admin/dashboard
Authorization: Bearer {expired_token}
```

**Backend Response**
```
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{ "message": "Unauthenticated" }
```

**Error Interceptor catches it**
```typescript
// error.interceptor.ts
intercept(request, next) {
  return next.handle(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Clear auth state
        this.authService.logout();
        // Redirect to login
        this.router.navigate(['/login']);
      }
      
      return throwError(() => error);
    })
  );
}
```

**Result**:
1. User logged out automatically
2. Redirected to login page
3. Must re-authenticate

## HTTP Request/Response Examples

### Register Request
```http
POST /api/auth/register HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Accept: application/json
Content-Length: 89

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

### Login Request
```http
POST /api/auth/login HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Accept: application/json
Content-Length: 78

{
  "email": "john@example.com",
  "password": "securepass123",
  "remember": true
}
```

### Protected Endpoint Request (with token)
```http
GET /api/user HTTP/1.1
Host: localhost:8000
Accept: application/json
Authorization: Bearer 1|abc123def456xyz789abc123def456
```

### Response Success
```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 156

{
  "token": "1|abc123def456xyz789abc123def456",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

## Debugging Tips

### Check Token in Browser
```javascript
// Open DevTools Console
localStorage.getItem('auth_token')
// Output: "1|abc123def456xyz789abc123def456"

localStorage.getItem('user')
// Output: "{"id":1,"name":"John Doe","email":"john@example.com","role":"student"}"
```

### Check Network Requests
1. Open DevTools → Network tab
2. Perform login
3. Find POST request to `/api/auth/login`
4. Check Response tab for token and user data
5. Check Headers tab for Authorization header on subsequent requests

### Check Authentication State
```typescript
// In component or service
this.authService.isLoggedIn()  // true or false
this.authService.getUserRole() // 'admin' | 'teacher' | 'student' | 'guest'
this.authService.getToken()    // token string or null

// Subscribe to observables
this.authService.isAuthenticated$.subscribe(isAuth => {
  console.log('Auth status:', isAuth);
});

this.authService.userRole$.subscribe(role => {
  console.log('User role:', role);
});
```

## Common Issues and Solutions

### Issue: "Cannot POST /api/auth/login"
**Solution**: 
- Verify backend is running on http://localhost:8000
- Check route is registered in Laravel routes file
- Verify CORS is configured in Laravel

### Issue: "401 Unauthorized" after login
**Solution**:
- Token may be expired (check expiration in Laravel .env)
- Token format may be incorrect (should start with `1|`)
- Backend may have cleared sessions

### Issue: "CORS error in console"
**Solution**:
- Check `CORS_ALLOWED_ORIGINS` in Laravel
- Verify `SANCTUM_STATEFUL_DOMAINS` includes frontend domain
- Ensure `Access-Control-Allow-Credentials` is set to true

### Issue: Form validation not working
**Solution**:
- Check email format validation with regex
- Check password length (minimum 8 characters)
- Check password confirmation matching

## Next: Backend Implementation

Now implement these endpoints in your Laravel backend:

1. **POST /api/auth/register** - Create new user with student role
2. **POST /api/auth/login** - Authenticate user and return Sanctum token
3. **GET /api/user** - Return authenticated user data

The frontend is ready and waiting for your backend!
