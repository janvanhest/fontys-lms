FROM node:20-alpine

WORKDIR /app

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

COPY package.json .npmrc ./
RUN pnpm install

COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]
