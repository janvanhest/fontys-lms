FROM node:22-alpine AS base

WORKDIR /app

ENV PNPM_HOME=/pnpm
ENV PNPM_STORE_DIR=/pnpm/store
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable
RUN pnpm config set store-dir $PNPM_STORE_DIR

FROM base AS deps

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

FROM deps AS development

COPY . .

EXPOSE 5173

CMD ["pnpm", "dev", "--host", "0.0.0.0", "--port", "5173"]

FROM deps AS build

ARG VITE_CHUCK_API_MODE
ARG VITE_CHUCK_API_BASE_URL
ENV VITE_CHUCK_API_MODE=$VITE_CHUCK_API_MODE
ENV VITE_CHUCK_API_BASE_URL=$VITE_CHUCK_API_BASE_URL

COPY . .

RUN pnpm build

FROM node:22-alpine AS production

WORKDIR /app

RUN npm install -g serve@14.2.4

COPY --from=build /app/dist ./dist

EXPOSE 4173

CMD ["serve", "-s", "dist", "-l", "4173"]
