# syntax=docker/dockerfile:1

# ---- 1) build the static site -------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# runs the typecheck + production build (also generates the service worker)
RUN npm run build

# ---- 2) serve it with nginx ---------------------------------------------------
FROM nginxinc/nginx-unprivileged:1.27-alpine AS serve
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
