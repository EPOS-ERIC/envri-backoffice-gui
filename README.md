# EPOS Back Office GUI

Essential commands and runtime config for local development and Docker deployment.

## Development

| Task                                 | Command            | Notes                                         |
| ------------------------------------ | ------------------ | --------------------------------------------- |
| Install dependencies                 | `pnpm install`     | Run once after checkout or dependency updates |
| Start open source development server | `pnpm run dev-oss` | Local URL: `http://localhost:4200/testpath`   |
| Start internal development server    | `pnpm run dev`     | Local URL: `http://localhost:4200/testpath`   |
| Regenerate API client                | `pnpm run codegen` | Updates files in `generated/`                 |

## Quality checks

| Task     | Command         | Notes                     |
| -------- | --------------- | ------------------------- |
| Run lint | `pnpm run lint` | Runs Angular ESLint rules |

## Build

| Task                             | Command              | Notes                                            |
| -------------------------------- | -------------------- | ------------------------------------------------ |
| Create open source build         | `pnpm run build-oss` | CI uses this build flavor                        |
| Create internal production build | `pnpm run build`     | Default/internal configuration                   |
| Regenerate API client            | `pnpm run codegen`   | Run before build when the backend schema changes |

Build output is written to `dist/browser`.

## Docker configuration

The container image supports runtime configuration via environment variables.

| Variable        | Default                  | Description                                                                                  |
| --------------- | ------------------------ | -------------------------------------------------------------------------------------------- |
| `BASE_URL`      | `/`                      | Base path where the app is served. Must start and end with `/` (for example `/backoffice/`). |
| `API_HOST`      | `http://gateway:5000`    | Upstream API URL used by nginx for `/api` requests.                                          |
| `AUTH_ROOT_URL` | `http://localhost:35000` | Browser-visible OAuth root URL injected into the OSS build at container startup.             |
| `SERVER_NAME`   | `_`                      | nginx `server_name` value.                                                                   |

Example:

```bash
docker run --rm -p 8080:80 \
  -e BASE_URL=/backoffice/ \
  -e API_HOST=https://api.example.org/ \
  -e AUTH_ROOT_URL=https://auth.example.org \
  -e SERVER_NAME=_ \
  epos-back-office:latest
```
