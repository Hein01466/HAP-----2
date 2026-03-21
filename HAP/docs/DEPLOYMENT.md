# Deployment Guide

## 1) Prepare Backend Environment
1. Copy `.env.production.example` to `.env.production`.
2. Set a strong `JWT_SECRET`.
3. Set `CORS_ORIGINS` to your frontend domain, for example `https://app.example.com`.
4. Keep `SWAGGER_ENABLED=false` for internet-facing production.

## 2) Run Production Stack with Docker Compose
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

This now starts:
- API on `PORT` (default `3000`)
- Frontend on `FRONTEND_PORT` (default `8080`)
- MongoDB internally for the API

## 3) Verify Services
```bash
curl http://localhost:3000/health
```

Expected status:
- `status` should be `ok`.

Open the frontend:
```bash
open http://localhost:8080
```

## 4) Seed Initial Data
```bash
docker compose -f docker-compose.prod.yml exec api npm run seed:admin
```

## 5) Frontend Publishing Options
Two supported paths now exist:

1. Docker deployment with the backend:
   - Set `VITE_API_URL` in `.env.production`
   - Run `docker compose -f docker-compose.prod.yml up -d --build`

2. Static hosting:
   - Copy `frontend/.env.production.example` to `frontend/.env.production`
   - Set `VITE_API_URL=https://your-api-domain`
   - Build `frontend/dist/`
   - Publish that folder to Vercel, Netlify, Cloudflare Pages, GitHub Pages, or Nginx

## 6) Upgrade Workflow
```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

If you use the Docker path, the frontend is rebuilt by Compose during deployment.

## 7) Recommended Domain Layout
- Frontend: `https://app.example.com`
- Backend API: `https://api.example.com`
- Set backend `CORS_ORIGINS=https://app.example.com`
- Set frontend `VITE_API_URL=https://api.example.com`

## 8) Backup Strategy (MongoDB)
Daily backup example:
```bash
docker compose -f docker-compose.prod.yml exec mongo sh -c 'mongodump --archive=/data/db/backup.archive'
```

Copy backup out:
```bash
docker cp $(docker compose -f docker-compose.prod.yml ps -q mongo):/data/db/backup.archive ./backup.archive
```
