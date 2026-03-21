# CI/CD Setup

## Workflows
- `.github/workflows/ci.yml`
  - Runs on PR and pushes to `main`/`master`
  - Executes backend quality checks: `npm ci`, `npm run lint`, `npm run test:ci`, `npm run build`
  - Executes frontend build validation: `cd frontend && npm ci && npm run build`

- `.github/workflows/release-image.yml`
  - Runs on pushes to `main`/`master` (and manual dispatch)
  - Builds Docker image and pushes to GHCR:
    - `ghcr.io/<owner>/hap-backend:latest` (main/master)
    - `ghcr.io/<owner>/hap-backend:sha-...`
    - `ghcr.io/<owner>/hap-backend:<branch>`

- `.github/workflows/deploy.yml`
  - Manual deployment over SSH
  - Pulls image tag and restarts with `docker-compose.deploy.yml`
  - Deploys the backend service and MongoDB only

## Required GitHub Secrets
Create these in your repository settings:
- `DEPLOY_HOST`: server host/IP
- `DEPLOY_USER`: ssh username
- `DEPLOY_SSH_KEY`: private key (PEM format)
- `DEPLOY_PORT`: ssh port (usually `22`)
- `DEPLOY_APP_DIR`: absolute path on server to this project
- `GHCR_READ_USER`: username allowed to pull GHCR package
- `GHCR_READ_TOKEN`: token with `read:packages`

## Server Requirements
- Docker and Docker Compose plugin installed
- Project folder exists at `DEPLOY_APP_DIR`
- `.env.production` exists on server
- `docker-compose.deploy.yml` present on server (from this repo)

## Deploy Flow
1. Push to `main` or `master` (builds and publishes image).
2. Publish the frontend separately from `frontend/dist` to your static host.
3. Run `Deploy` workflow manually for the backend.
4. Set `image_tag` input:
   - `latest` for newest stable image
   - `sha-...` to pin a specific build
