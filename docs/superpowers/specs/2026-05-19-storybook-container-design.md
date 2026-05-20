# Storybook Container Design

## Context

The repository already runs the main application services in Docker Compose for development. The frontend app is containerized through `frontend/Dockerfile` and exposed on port `5173` via `compose.override.yaml`. Storybook is already installed in `frontend/package.json`, but the current documented workflow starts it locally outside Docker in a separate terminal.

This creates an inconsistent developer experience: the main frontend uses the containerized dev workflow, while Storybook does not.

## Goal

Add Storybook to the development container setup as a separate Compose service, without changing the existing `frontend` service behavior.

## Non-Goals

- No replacement of the existing `frontend` service.
- No separate Storybook-specific Dockerfile unless the current frontend image proves insufficient.
- No production deployment changes for Storybook.

## Recommended Approach

Add a dedicated `storybook` service to `compose.override.yaml` that reuses the existing frontend development image and runs Storybook on port `6006`.

This keeps the current app container unchanged, while making Storybook available through the same container-first workflow as the rest of the stack.

## Alternatives Considered

### Reuse `frontend` service and switch commands

This would reduce the number of services, but it would force developers to choose between app and Storybook behavior. That weakens the current workflow and makes concurrent use harder.

### Create a separate Storybook Dockerfile or build target

This would make the setup more explicit, but it adds maintenance overhead without a current technical need. The existing frontend development image already contains the needed toolchain.

## Service Design

The new `storybook` service should:

- use `./frontend` as build context
- use the `development` target from `frontend/Dockerfile`
- expose port `6006:6006`
- run Storybook with host binding on `0.0.0.0`
- reuse the same dependency caching pattern as the frontend service
- watch relevant frontend files for development changes

The preferred runtime command is:

```sh
pnpm storybook -- --host 0.0.0.0 -p 6006
```

This can be set directly in Compose. If the script in `frontend/package.json` is updated to include host binding by default, the Compose command can stay simpler, but the design does not require that change.

## Volume Strategy

The service should follow the existing frontend volume pattern:

- named volume for `/app/node_modules`
- named volume for `/pnpm/store`

This keeps dependency installation and package caching consistent with the existing dev container.

Using the same named volumes as `frontend` is acceptable here because both services are based on the same project and dependency set. There is no current need for full isolation through separate Storybook-only volumes.

## File Watch Strategy

The service should include `develop.watch` entries aligned with the existing frontend service:

- sync `./frontend/src` to `/app/src`
- rebuild on `./frontend/package.json`
- rebuild on `./frontend/pnpm-lock.yaml`

If Storybook configuration files such as `.storybook/*` are present or added later, they should also be included in watch rules.

## Dependency Behavior

`depends_on` should remain minimal.

Storybook should not depend on backend services unless stories actually require those services at runtime. If current stories rely on the mock API, `depends_on: [mock-api]` is acceptable. Otherwise, the service should start independently.

## Documentation Changes

The frontend documentation should be updated so that Storybook is described as part of the Docker Compose development workflow instead of a separate local-only terminal step.

The root documentation should continue to describe the shared Compose setup and should mention that Storybook is available on port `6006` when the development stack is started.

## Testing And Verification

Verification should cover:

- Compose config remains valid
- `storybook` service starts successfully
- Storybook is reachable at `http://localhost:6006`
- frontend app remains reachable at `http://localhost:5173`
- existing frontend container behavior is unchanged

## Implementation Scope

Expected files to change:

- `compose.override.yaml`
- `frontend/package.json` optionally, if host binding is moved into the script
- `frontend/README.md`
- `README.md` if the root setup should mention Storybook explicitly
