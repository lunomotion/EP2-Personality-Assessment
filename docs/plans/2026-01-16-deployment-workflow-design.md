# Deployment Workflow Design

## Overview

GitHub Actions workflow to deploy Praxia Insights to a server via SSH with password authentication.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Server                                    │
├─────────────────────────────────────────────────────────────────┤
│  /n8n/ (existing)              │  /opt/praxiainsights/ (new)    │
│  ├── n8n container             │  ├── docker-compose.prod.yml   │
│  ├── nginx (80/443)            │  └── app container (:3001)     │
│  ├── postgres-1  ◄─────────────┼──────┘ (shared database)       │
│  ├── gotenberg (:3000)         │                                │
│  └── certbot                   │                                │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### GitHub Secrets Required

| Secret | Description |
|--------|-------------|
| `SSH_HOST` | Server IP or hostname |
| `SSH_USER` | SSH username |
| `SSH_PASSWORD` | SSH password |
| `SSH_PORT` | SSH port (optional, defaults to 22) |
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_BASE_URL` | App URL (e.g., http://server:3001) |

### Files Created

1. **`.github/workflows/deploy.yml`** - GitHub Actions workflow
2. **`docker-compose.prod.yml`** - Production Docker Compose config

### Deployment Flow

1. Push to `main` branch triggers workflow
2. SSH into server using password auth
3. Clone/pull repo to `/opt/praxiainsights`
4. Generate `.env` from GitHub Secrets
5. Build Docker image (uses existing Dockerfile)
6. Start container on port 3001
7. Run Prisma migrations (db push)
8. Health check

### Database Strategy

- Shares PostgreSQL with n8n stack (`n8n-postgres-1`)
- Database: `praxiainsights`
- Connects via Docker network `n8n_default`
- Prisma migrations run separately (don't affect n8n data)

### Network Configuration

- App container joins `n8n_default` network
- Connects to postgres at `n8n-postgres-1:5432`
- Exposed externally on port `3001`

## Future: Reverse Proxy Setup

When `app.praxiainsights.com` A record is ready, add to nginx config:

```nginx
server {
    listen 443 ssl;
    server_name app.praxiainsights.com;

    ssl_certificate /etc/letsencrypt/live/app.praxiainsights.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.praxiainsights.com/privkey.pem;

    location / {
        proxy_pass http://praxiainsights-app:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Webhook Testing with n8n

Since n8n runs on the same server, configure n8n workflow to send webhook to:
- Internal: `http://praxiainsights-app:3000/api/webhook/typeform`
- External: `http://SERVER_IP:3001/api/webhook/typeform`
