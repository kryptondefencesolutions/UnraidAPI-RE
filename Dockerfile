# UnraidAPI-RE on Node 24 (Node 16 is end-of-life and gets no security fixes, e.g. the October 2026
# Node.js release: CVE-2026-111497 and others). Two stages: build with dev dependencies, then ship
# only production dependencies and the built .nuxt output.
FROM node:24-slim AS build
# deasync (a dependency) compiles a native addon: build tools in this stage only.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
# Nuxt 2 / webpack 4 hash with MD4, which OpenSSL 3 (Node 17+) only offers through the legacy
# provider. Build-time only; the server at runtime doesn't need it.
ENV NODE_OPTIONS="--openssl-legacy-provider --max_old_space_size=4096"
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps --no-audit --no-fund
COPY . .
RUN npm run build && npm prune --omit=dev --legacy-peer-deps

FROM node:24-slim
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=80 \
    NODE_OPTIONS="--max_old_space_size=4096"
WORKDIR /app
COPY --from=build /app /app
EXPOSE 80
CMD ["npm", "start"]
