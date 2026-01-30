# Piston Standalone Setup

Minimal Piston environment for testing, CI/CD, or isolated deployment.

## Quick Start

```bash
# Start Piston
docker compose -f docker-compose.piston.yml up -d

# Watch setup
docker compose -f docker-compose.piston.yml logs -f piston-setup

# Test
curl http://localhost:2000/api/v2/runtimes
```

## When to Use

- CI/CD pipelines
- Testing Piston in isolation
- Running Piston on separate server

**Note:** You can use `docker-compose.local.yml` for local development with full stack.

## Testing Steps

### 1. Start

```bash
docker compose -f docker-compose.piston.yml up -d
```

### 2. Monitor

```bash
docker compose -f docker-compose.piston.yml logs -f piston-setup
```

### 3. Verify

```bash
# Check status
docker compose -f docker-compose.piston.yml ps

# Test API
curl http://localhost:2000/api/v2/runtimes

# Execute code
curl -X POST http://localhost:2000/api/v2/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "version": "3.10.0",
    "files": [{"name": "main.py", "content": "print(\"Hello!\")"}]
  }'
```

### 4. Test Idempotency

```bash
# Run setup again
docker compose -f docker-compose.piston.yml up piston-setup

# Should show "already installed"
docker compose -f docker-compose.piston.yml logs piston-setup | grep "already installed"
```

## Custom Port

```bash
PISTON_PORT=3000 docker compose -f docker-compose.piston.yml up -d
curl http://localhost:3000/api/v2/runtimes
```

## Configuration

Edit `apps/piston/.env`:

```bash
PISTON_DISABLE_NETWORKING=true
PISTON_MAX_CONCURRENT_JOBS=64
PISTON_RUN_TIMEOUT=3000
```

See [configuration.md](./configuration.md) for all options.

## Troubleshooting

**Setup fails**

```bash
docker compose -f docker-compose.piston.yml logs piston-setup
```

**Piston not responding**

```bash
docker compose -f docker-compose.piston.yml logs piston
```

**Port conflict**

```bash
PISTON_PORT=3000 docker compose -f docker-compose.piston.yml up -d
```

## Cleanup

```bash
# Stop
docker compose -f docker-compose.piston.yml down

# Remove everything
docker compose -f docker-compose.piston.yml down -v
```
