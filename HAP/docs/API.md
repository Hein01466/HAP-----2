# API Documentation

## Live OpenAPI
- Development: `http://localhost:3000/docs`
- Production: disabled by default (`SWAGGER_ENABLED=false`)

## Authentication
1) Register user:
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "passw0rd"
}
```

2) Login:
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "passw0rd"
}
```

3) Use bearer token:
```http
Authorization: Bearer <access_token>
```

## Health Endpoint
```http
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-19T00:00:00.000Z",
  "service": "hap-backend"
}
```

## Module Endpoints
All protected routes require a JWT bearer token.
- `/users`
- `/departments`
- `/assets`
- `/employees`
- `/projects`
- `/tasks`
- `/requests`
- `/inventory`
- `/vendors`
- `/purchase-orders`
- `/maintenance`
- `/settings`
- `/audit-logs`
