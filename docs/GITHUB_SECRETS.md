# GitHub Secrets – coursue-admin

Cấu hình các secret sau trong **Settings → Secrets and variables → Actions** của repo.

## Required Secrets

| Secret | Mô tả | Ví dụ |
|--------|-------|-------|
| `VPS_HOST` | IP hoặc domain của VPS | `144.91.120.200` |
| `VPS_USER` | SSH user trên VPS | `ubuntu` |
| `VPS_SSH_KEY` | Private SSH key để kết nối VPS | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `NEXT_PUBLIC_API_URL` | URL backend API | `https://api.yourdomain.com/api/v1` |

## Optional Secrets (Docker Hub push)

| Secret | Mô tả |
|--------|-------|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password / access token |

---

## Workflow triggers

| Event | Lint | Build & Deploy |
|-------|------|----------------|
| `push` → `main` / `develop` | ✅ | ✅ |
| `pull_request` → `main` / `develop` | ✅ | ❌ |
| `workflow_dispatch` (manual) | ✅ | ✅ |

---

## Manual deploy

```bash
# Build & run locally
docker compose up --build

# Production (pre-built image)
docker compose -f docker-compose.prod.yml up -d
```

## VPS folder structure (after deploy)

```
/home/<VPS_USER>/coursue-admin/
├── docker-compose.prod.yml
└── .env
```

