# Render Deployment Guide

This repo is prepared for Render with:

- one Node web service for the backend
- one static site for the frontend
- MongoDB Atlas as the database

The repo blueprint file is:

- [render.yaml](/Users/zzm/Desktop/Management%20System/HAP/render.yaml)

## 1. Push the repo to GitHub

Push this project to a GitHub repository first.

## 2. Create the backend on Render

In Render:

1. Click `New +`
2. Choose `Blueprint`
3. Select your GitHub repo
4. Render will detect [render.yaml](/Users/zzm/Desktop/Management%20System/HAP/render.yaml)

This creates:

- `hap-api`
- `hap-frontend`

## 3. Set backend environment variables

For `hap-api`, fill in these required values:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@hap--2.75lhabo.mongodb.net/hap?retryWrites=true&w=majority&appName=HAP--2
JWT_SECRET=<long-random-secret>
CORS_ORIGINS=https://<your-frontend>.onrender.com
ADMIN_EMAIL=<your-email>
ADMIN_PASSWORD=<strong-password>
SUPPORT_EMAIL=<your-email>
```

Already prefilled by the blueprint:

```env
NODE_ENV=production
PORT=3000
JWT_EXPIRES_IN=1d
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100
SWAGGER_ENABLED=false
SWAGGER_PATH=docs
DEFAULT_DEPARTMENT=Administration
SMTP_PORT=587
SMTP_SECURE=false
```

## 4. Set frontend environment variable

For `hap-frontend`, set:

```env
VITE_API_URL=https://<your-backend>.onrender.com
```

## 5. Redeploy in the correct order

1. Deploy `hap-api`
2. Copy its public URL
3. Set `VITE_API_URL` in `hap-frontend`
4. Deploy `hap-frontend`
5. Copy the frontend URL
6. Update backend `CORS_ORIGINS` to the frontend URL
7. Redeploy `hap-api`

## 6. Verify

Backend checks:

- `https://<your-backend>.onrender.com/health`
- `https://<your-backend>.onrender.com/docs` if Swagger is enabled

Frontend check:

- open `https://<your-frontend>.onrender.com`

## 7. Important production notes

- Rotate the Atlas password you pasted into chat and update `MONGODB_URI` afterward.
- Uploaded files are stored locally by the backend, which is not durable on many cloud platforms.
- For stable production uploads, move images/files to cloud storage such as S3 or Cloudinary.
