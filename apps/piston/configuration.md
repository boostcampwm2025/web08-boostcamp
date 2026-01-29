# Piston Configuration

This directory contains the Piston code execution engine setup and configuration.

## Files

- `Dockerfile` - Container image for language runtime installation
- `setup.sh` - Script to install language runtimes (gcc, java, node, typescript, python)
- `.env` - Piston runtime configuration
- `.env.example` - Template for configuration

## Configuration

### Quick Start

The default configuration in `.env` is production-ready with secure defaults:

- Networking disabled for executed code
- Resource limits enabled
- 64 concurrent jobs maximum

### Customizing Configuration

Edit `.env` to adjust Piston behavior:

```bash
# Security
PISTON_DISABLE_NETWORKING=true    # Disable network access in code execution

# Performance
PISTON_MAX_CONCURRENT_JOBS=64     # Max simultaneous executions
PISTON_RUN_TIMEOUT=3000           # Execution timeout (ms)

# Resource Limits
PISTON_MAX_FILE_SIZE=10000000     # 10MB max file size
PISTON_OUTPUT_MAX_SIZE=1024       # Max output buffer size
```

See the [official configuration documentation](https://github.com/engineer-man/piston/blob/master/docs/configuration.md) for all available options.

### Port Configuration

Change the external port by setting `PISTON_PORT`:

```bash
# In apps/piston/.env
PISTON_PORT=3000
```

Or override via command line:

```bash
PISTON_PORT=3000 docker compose -f docker-compose.piston.yml up
```

**Note:** The internal container port is always `2000`.

## Usage

### Standalone

```bash
docker compose -f docker-compose.piston.yml up -d
```

### With Full Stack

```bash
docker compose -f docker-compose.local.yml --env-file ./apps/server/.env up -d
```

## Language Runtimes

The setup automatically installs:

- **C/C++** (gcc 10.2.0)
- **Java** (15.0.2)
- **JavaScript** (node 20.11.1)
- **TypeScript** (5.0.3)
- **Python** (3.10.0)

To modify installed runtimes, edit the `RUNTIMES` array in `setup.sh`.
To see all available language packages and versions:

```bash
curl http://localhost:2000/api/v2/packages
```

## API Access

### Local Development (docker-compose.local.yml)

From your terminal:

```bash
curl http://localhost:2000/api/v2/runtimes
```

From your application code:

```javascript
// apps/server/.env
PISTON_API_URL=http://piston:2000/api/v2
```

### Standalone (docker-compose.piston.yml)

```bash
curl http://localhost:2000/api/v2/runtimes
```

## Security Notes

1. **Network Isolation**: `PISTON_DISABLE_NETWORKING=true` prevents executed code from making network requests
2. **Resource Limits**: File size, memory, and process limits prevent resource exhaustion
3. **Timeouts**: Execution timeouts prevent infinite loops
4. **Privileged Mode**: Required for Piston's sandboxing to work properly

## Troubleshooting

### Check Setup Progress

```bash
docker compose -f docker-compose.local.yml --env-file ./apps/server/.env logs -f piston-setup
```

### Verify Installed Runtimes

From your host machine:

```bash
curl http://localhost:2000/api/v2/runtimes
```

### Test Code Execution

From your host machine:

```bash
curl -X POST http://localhost:2000/api/v2/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "version": "3.10.0",
    "files": [{"name": "main.py", "content": "print(\"Hello world!\")"}]
  }'
```

### Test Idempotency

Run the setup twice to verify packages aren't reinstalled:

```bash
# First run
docker compose -f docker-compose.local.yml --env-file ./apps/server/.env up piston-setup

# Second run
docker compose -f docker-compose.local.yml --env-file ./apps/server/.env up piston-setup

# Check logs
docker compose -f docker-compose.local.yml --env-file ./apps/server/.env logs piston-setup | grep "already installed"
```
