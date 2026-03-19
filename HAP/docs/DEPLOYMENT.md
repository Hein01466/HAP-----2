# Deployment Guide

## 1) Prepare Environment
1. Copy `.env.production.example` to `.env.production`.
2. Set a strong `JWT_SECRET`.
3. Set `CORS_ORIGINS` to your frontend domain.
4. Keep `SWAGGER_ENABLED=false` for internet-facing production.

## 2) Run with Docker Compose
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## 3) Verify Service
```bash
curl http://localhost:3000/health
```

Expected status:
- `status` should be `ok`.

## 4) Seed Initial Data
```bash
docker compose -f docker-compose.prod.yml exec api npm run seed:admin
```

## 5) Upgrade Workflow
```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## 6) Backup Strategy (MongoDB)
Daily backup example:
```bash
docker compose -f docker-compose.prod.yml exec mongo sh -c 'mongodump --archive=/data/db/backup.archive'
```

Copy backup out:
```bash
docker cp $(docker compose -f docker-compose.prod.yml ps -q mongo):/data/db/backup.archive ./backup.archive
```
