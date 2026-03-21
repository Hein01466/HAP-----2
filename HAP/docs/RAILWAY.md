# Railway Deployment Guide

This project is ready to deploy to Railway as two app services in one Railway project:

- `api`
- `frontend`

Use MongoDB Atlas as the database.

## Why this layout

Railway supports deploying multiple services from one repository, including Dockerfile-based services and monorepos with per-service root directories. The recommended setup for this repo is:

- backend service root directory: `/`
- frontend service root directory: `/frontend`
- database service: MongoDB Atlas

## Service Setup

### 1. Create a Railway project

Create one new Railway project.

### 2. Prepare MongoDB Atlas

Use your Atlas connection string for:

- `MONGODB_URI`

Example format:

```env
mongodb+srv://<user>:<password>@hap--2.75lhabo.mongodb.net/hap?retryWrites=true&w=majority&appName=HAP--2
```

### 3. Add the API service

Create a service from this repository.

Set:

- Root Directory: `/`
- Service source: GitHub repo

Railway will detect the root `Dockerfile` automatically.

Required variables:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=<mongodb-atlas-uri>
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=1d
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100
CORS_ORIGINS=https://<your-frontend-domain>
SWAGGER_ENABLED=false
SWAGGER_PATH=docs
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<strong-password>
DEFAULT_DEPARTMENT=Administration
SUPPORT_EMAIL=support@example.com
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_SECURE=false
SMTP_FROM=
```

Expose the API on:

- public domain: `https://api.your-domain.com`

### 4. Add the frontend service

Create another service from the same repository.

Set:

- Root Directory: `/frontend`
- Service source: GitHub repo

Railway will detect [frontend/Dockerfile](/Users/zzm/Desktop/Management%20System/HAP/frontend/Dockerfile).

Required variables:

```env
VITE_API_URL=https://api.<your-domain>
```

Expose the frontend on:

- public domain: `https://app.your-domain.com`

## Domains

Recommended setup:

- frontend: `app.your-domain.com`
- backend: `api.your-domain.com`

Then set:

- API `CORS_ORIGINS=https://app.your-domain.com`
- Frontend `VITE_API_URL=https://api.your-domain.com`

## Deploy Flow

1. Push this repository to GitHub.
2. In Railway, create the two services above.
3. Set each service root directory.
4. Set the environment variables.
5. Assign public domains to `api` and `frontend`.
6. Redeploy both services.

## Notes

- The API and frontend are ready for Railway Dockerfile deployment.
- The frontend is static and served by Nginx.
- The backend requires MongoDB Atlas network access to allow Railway connections.
