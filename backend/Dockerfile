FROM node:22-alpine AS base

WORKDIR /app

ENV PNPM_HOME=/pnpm
ENV PNPM_STORE_DIR=/pnpm/store
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable
RUN pnpm config set store-dir $PNPM_STORE_DIR

FROM base AS deps

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --config.dangerouslyAllowAllBuilds=true

FROM deps AS development

COPY . .

EXPOSE 3000

CMD ["pnpm", "run", "start:dev"]

FROM deps AS build

COPY . .

RUN pnpm run build

FROM node:22-alpine AS production

WORKDIR /app

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --prod --frozen-lockfile --config.dangerouslyAllowAllBuilds=true

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
