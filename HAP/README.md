# HAP Management System Backend

NestJS + MongoDB API with admin/user roles and CRUD for departments and assets.

## Quick Start
1) Copy `.env.example` to `.env` and update values.
2) Install dependencies: `npm install`
3) Run dev server: `npm run start:dev`

## Auth
- Register: `POST /auth/register`
- Login: `POST /auth/login`

## Default Roles
- `admin` can create/update/delete.
- `user` can read.
