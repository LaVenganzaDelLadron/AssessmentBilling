# Backend Integration Guide

## Overview

This document explains how the Angular frontend is integrated with the Laravel backend for authentication and authorization.

## Architecture

### Frontend Layer
- **AuthService**: Manages authentication state and HTTP communication with backend
- **Guards**: Protect routes based on user role (admin, teacher, student)
- **Interceptors**: Attach authentication tokens to requests and handle errors

### Backend Requirements
- **Endpoints**: `/api/auth/register` and `/api/auth/login`
- **Authentication**: Laravel Sanctum (token-based)
- **Response Format**: JSON with token and user data

## Setup Instructions

### 1. Backend Configuration

Ensure your Laravel `.env` has Sanctum configured:
```env
SANCTUM_STATEFUL_DOMAINS=localhost:4200,127.0.0.1:4200
SANCTUM_EXPIRATION=1440  # Token expiration in minutes
```

### 2. Frontend API URL

The frontend is configured to call `http://localhost:8000/api`. Update this in:
- **File**: `src/app/features/auth/services/auth.service.ts`
- **Line**: `private apiUrl = 'http://localhost:8000/api';`

If your backend is on a different host/port, update the `apiUrl` variable.

### 3. CORS Configuration

Ensure your Laravel CORS middleware allows requests from your frontend:
```php
// config/cors.php
'allowed_origins' => ['http://localhost:4200'],
'supports_credentials' => true,
```

## API Endpoints

### Register
**Endpoint**: `POST /api/auth/register`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation Rules** (from Laravel):
- `name`: required, string, max:255
- `email`: required, string, email, max:255, unique:users,email
- `password`: required, string, min:8
- `role`: automatically set to 'student' on backend

**Success Response (200)**:
```json
{
  "token": "1|abc123def456xyz789...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

**Error Response (422 - Validation)**:
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["Email is already taken."],
    "password": ["Password must be at least 8 characters long."]
  }
}
```

### Login
**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123",
  "remember": true
}
```

**Validation Rules** (from Laravel):
- `email`: required, string, email
- `password`: required, string

**Rate Limiting**: 5 attempts per email|IP per 15 minutes

**Success Response (200)**:
```json
{
  "token": "1|abc123def456xyz789...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

**Error Response (401 - Invalid Credentials)**:
```json
{
  "message": "Invalid credentials"
}
```

**Error Response (429 - Rate Limited)**:
```json
{
  "message": "Too many login attempts. Please try again in {seconds} seconds."
}
```

### Get User Profile
**Endpoint**: `GET /api/user`

**Headers**:
```
Authorization: Bearer {token}
```

**Success Response (200)**:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student"
}
```

**Error Response (401 - Unauthorized)**:
- Token is invalid or expired
- User will be logged out automatically
- Redirected to login page

## Frontend State Management

### AuthService Methods

#### `login(credentials: LoginCredentials): Observable<AuthResponse>`
Makes POST request to `/api/auth/login` and stores token/user on success.

**Usage**:
```typescript
this.authService.login({
  email: 'user@example.com',
  password: 'password',
  remember: true
}).subscribe({
  next: (response) => {
    // Redirect to appropriate dashboard
  },
  error: (error) => {
    // Show error message
  }
});
```

#### `register(data: RegisterData): Observable<AuthResponse>`
Makes POST request to `/api/auth/register` and stores token/user on success.

**Usage**:
```typescript
this.authService.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
}).subscribe({
  next: () => {
    // Redirect to student dashboard
  },
  error: (error) => {
    // Show error message
  }
});
```

#### `logout(): void`
Clears all authentication data from localStorage and BehaviorSubjects.

#### `isLoggedIn(): boolean`
Returns true if user has valid token and is authenticated.

#### `getUserRole(): UserRole`
Returns current user's role: 'admin' | 'teacher' | 'student' | 'guest'.

#### `hasRole(role: UserRole | UserRole[]): boolean`
Checks if user has specified role(s).

### Token Storage

Tokens are stored in browser localStorage:
- **Key**: `auth_token`
- **Format**: Bearer token from Sanctum
- **Scope**: Same-site only (not accessible via scripts in production with secure/httpOnly cookies)

User data is stored as:
- **Key**: `user`
- **Format**: JSON stringified user object

## Authentication Flow

### Registration Flow
1. User fills registration form (name, email, password)
2. Client validates form (8+ char password, email format, password match)
3. Submit calls `AuthService.register()`
4. POST request to `/api/auth/register` with credentials
5. Backend validates and creates user with 'student' role
6. Returns token and user data
7. Frontend stores token and user in localStorage
8. User redirected to `/student` dashboard

### Login Flow
1. User enters email and password
2. Client validates form (email required, password 8+ chars)
3. Submit calls `AuthService.login()`
4. POST request to `/api/auth/login` with credentials
5. Backend validates credentials and rate limiting
6. Returns token and user data (includes role)
7. Frontend stores token and user in localStorage
8. User redirected based on role:
   - `admin` → `/admin`
   - `teacher` → `/teacher`
   - `student` → `/student`

### Protected Route Access
1. User attempts to access route (e.g., `/admin`)
2. Angular route guard (`AdminGuard`) intercepts
3. Guard checks `AuthService.isLoggedIn()` and `AuthService.hasRole('admin')`
4. If authenticated and authorized → allow access
5. If not authenticated → redirect to `/login`
6. If authenticated but unauthorized → redirect to `/`

### Request Flow with Token
1. User makes authenticated request (GET `/api/user`)
2. `AuthInterceptor` intercepts request
3. Retrieves token from `AuthService.getToken()`
4. Adds `Authorization: Bearer {token}` header
5. Request sent to backend
6. Backend validates token with Sanctum
7. If valid → process request
8. If invalid (401) → `ErrorInterceptor` catches, logs out user, redirects to login

## Error Handling

### Client-Side Validation
- Form fields are validated before submission
- Email format validation (basic regex)
- Password length (minimum 8 characters)
- Password confirmation matching

### Server-Side Error Handling
The frontend extracts and displays errors from backend responses:

**Validation Errors (422)**:
- Field-specific errors displayed next to form inputs
- Example: "Email is already taken"

**Rate Limiting (429)**:
- Generic message: "Too many login attempts. Please try again later."
- Frontend doesn't retry automatically

**Invalid Credentials (401)**:
- Generic message: "Invalid credentials"
- No user data leaked

**Network Errors**:
- Generic message: "An error occurred"
- Check browser console for details

## Security Considerations

### Token Security
1. **httpOnly Flag**: In production, use httpOnly cookies instead of localStorage
2. **Secure Flag**: Use HTTPS in production
3. **Expiration**: Configure token expiration in Laravel (.env `SANCTUM_EXPIRATION`)
4. **Refresh**: Implement token refresh logic if needed

### CSRF Protection
1. Ensure Laravel CSRF middleware is configured
2. If using cookies, CSRF token is handled automatically
3. If using custom headers, add `X-CSRF-TOKEN` header

### CORS Configuration
1. Only allow requests from your frontend domain
2. Use `supports_credentials: true` for cookie-based auth
3. Set appropriate `Access-Control-Allow-Origin` header

### User Isolation
1. Guards prevent unauthorized access to portals
2. Backend should implement row-level security for user-specific data
3. Teachers can only see their subjects
4. Students can only see their enrollments

## Troubleshooting

### "Port 4200 is already in use"
Kill existing process:
```bash
lsof -ti:4200 | xargs kill -9
npm start
```

### "Cannot POST /api/auth/login"
- Check backend is running on `http://localhost:8000`
- Verify route is registered in Laravel
- Check CORS configuration

### "401 Unauthorized"
- Token may be expired
- Token format invalid (missing "Bearer " prefix)
- Backend might have logged out the token
- Check token in localStorage

### "422 Validation Error"
- Form data doesn't match backend expectations
- Check error details in browser Network tab
- Ensure email format and password length

### "CORS error"
- Check Laravel CORS configuration
- Verify `SANCTUM_STATEFUL_DOMAINS` includes frontend URL
- Check `Origin` header in request matches allowed origins

## Testing with cURL

### Test Register
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Protected Endpoint
```bash
curl -X GET http://localhost:8000/api/user \
  -H "Authorization: Bearer {token}"
```

## Next Steps

1. **Backend Implementation**: Implement the auth endpoints in Laravel
2. **Database**: Set up users table with name, email, password, role
3. **Testing**: Test authentication flows with the frontend
4. **Deployment**: Move to HTTPS and configure environment variables
5. **Frontend Features**: Add logout button, profile page, password reset

## Related Files

- `src/app/features/auth/services/auth.service.ts` - Main authentication service
- `src/app/core/guards/auth.guard.ts` - Route guards
- `src/app/core/interceptors/auth.interceptor.ts` - Token injection
- `src/app/core/interceptors/error.interceptor.ts` - Error handling
- `src/app/features/auth/pages/login/login.ts` - Login component
- `src/app/features/auth/pages/register/register.ts` - Register component
