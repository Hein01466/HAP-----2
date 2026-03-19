# HAP Management System Backend

NestJS + MongoDB API with admin/user roles and CRUD for departments and assets.

## Quick Start
1) Copy `.env.example` to `.env` and update values.
2) Install dependencies: `npm install`
3) Run dev server: `npm run start:dev`
4) Open Swagger docs: `http://localhost:3000/docs`
5) Health check: `GET http://localhost:3000/health`

## Auth
- Register: `POST /auth/register`
- Login: `POST /auth/login`

## Default Roles
- `admin` can create/update/delete.
- `user` can read.

## Testing
- Run tests: `npm test`
- Run coverage: `npm run test:cov`

## Production
- Container build: `docker build -t hap-backend .`
- Container deploy: `docker compose -f docker-compose.prod.yml up -d --build`
- Deployment details: `docs/DEPLOYMENT.md`
- CI/CD details: `docs/CICD.md`
