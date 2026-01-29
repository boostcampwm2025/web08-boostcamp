# Piston Code Execution Engine

Setup for [Piston](https://github.com/engineer-man/piston) - a high performance general purpose code execution engine.

## Quick Start

```bash
# Local development
docker compose -f docker-compose.local.yml --env-file ./apps/server/.env up -d

# Standalone
docker compose -f docker-compose.piston.yml up -d
```

## What's Included

- **Language Installation** - Installs gcc, Java, Node.js, TypeScript, and Python on startup
- **Idempotent Setup** - Safe to run multiple times, won't reinstall existing packages
- **Configuration** - Customize resource limits, timeouts, and security settings

## Installed Languages

- C/C++ (gcc 10.2.0)
- Java (15.0.2)
- JavaScript (node 20.11.1)
- TypeScript (5.0.3)
- Python (3.10.0)

## Documentation

- **[configuration.md](./configuration.md)** - Configuration options, API usage, and troubleshooting
- **[deploy.md](./deploy.md)** - Standalone deployment guide for CI/CD and testing
- **[Official Piston Docs](https://github.com/engineer-man/piston)** - Full API reference and language support

## Files

- `Dockerfile` - Setup container image
- `setup.sh` - Language installation script
- `.env` - Piston configuration
- `.env.example` - Configuration template

## Example Usage

```bash
# Execute Python code
curl -X POST http://localhost:2000/api/v2/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "version": "3.10.0",
    "files": [{
      "name": "main.py",
      "content": "print(\"Hello from Piston!\")"
    }]
  }'
```

## Links

- [Piston GitHub Repository](https://github.com/engineer-man/piston)
- [Piston API Documentation](https://github.com/engineer-man/piston/blob/master/docs/api-v2.md)
- [Piston Configuration Documentation](https://github.com/engineer-man/piston/blob/master/docs/configuration.md)
- [Supported Languages](https://github.com/engineer-man/piston#supported-languages)
