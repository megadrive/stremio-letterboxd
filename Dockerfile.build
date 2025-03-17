FROM node:22.14.0

ENV NODE_ENV=production

RUN apt-get update && apt-get install -y git build-essential

WORKDIR /app

COPY . .

RUN npm install -g pnpm@10.5.0 && pnpm install

RUN pnpm build
