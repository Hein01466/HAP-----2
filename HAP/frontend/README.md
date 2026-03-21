# HAP Frontend

React + Vite frontend for the HAP management backend.

## Setup
1. Copy `.env.example` to `.env`
2. Set `VITE_API_URL` to your backend URL
3. Install dependencies: `npm install`
4. Run dev server: `npm run dev`

## Build
- Production build: `npm run build`
- Preview: `npm run preview`

## Publish
1. Create `.env.production` with:
   - `VITE_API_URL=https://your-api-domain`
2. Build the app:
   - `npm ci`
   - `npm run build`
3. Publish the generated `dist/` folder to a static host such as Vercel, Netlify, Cloudflare Pages, GitHub Pages, or an Nginx server.
4. Make sure the backend `CORS_ORIGINS` value includes your frontend domain.

## Docker Publish
This frontend can also be published as a container together with the backend.

```bash
docker compose -f ../docker-compose.prod.yml up -d --build
```

Defaults:
- frontend: `http://localhost:8080`
- backend: `http://localhost:3000`
