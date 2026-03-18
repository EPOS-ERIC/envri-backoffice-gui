# EPOS Back Office GUI

Essential commands and runtime config for local development and Docker deployment.

## Development

| Task                         | Command            | Notes                                         |
| ---------------------------- | ------------------ | --------------------------------------------- |
| Install dependencies         | `pnpm install`     | Run once after checkout or dependency updates |
| Start default dev server     | `pnpm run dev`     | Local URL: `http://localhost:4200/testpath`   |
| Start open source dev server | `pnpm run dev-oss` | Local URL: `http://localhost:4200/testpath`   |

## Quality checks

| Task                 | Command              | Notes                                        |
| -------------------- | -------------------- | -------------------------------------------- |
| Run lint             | `pnpm run lint`      | Currently fails on existing repo-wide issues |
| Create default build | `pnpm run build`     | Outputs Angular production assets            |
| Create OSS build     | `pnpm run build-oss` | Outputs Angular OSS production assets        |

Build output is written to `dist/browser`.

## Docker configuration

The container image supports runtime configuration via environment variables.

| Variable      | Default               | Description                                                     |
| ------------- | --------------------- | --------------------------------------------------------------- |
| `BASE_URL`    | `/`                   | Base path where the app is served. Must start and end with `/`. |
| `API_HOST`    | `http://gateway:5000` | Upstream API host used by nginx for `/api` requests.            |
| `SERVER_NAME` | `_`                   | nginx `server_name` value.                                      |

Example:

```bash
docker run --rm -p 8080:80 \
  -e BASE_URL=/backoffice/ \
  -e API_HOST=https://api.example.org \
  -e SERVER_NAME=_ \
  epos-back-office:latest
```
