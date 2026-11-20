# =====================================================================
# Dockerfile del frontend DisGas (React + Vite) — 2 etapas:
#   1) node  : instala dependencias y COMPILA (npm run build -> carpeta dist)
#   2) nginx : sirve solo los archivos estáticos de dist (imagen final liviana)
# =====================================================================

# ---------- Etapa 1: compilar ----------
FROM node:22-alpine AS build
WORKDIR /app

# Primero solo los archivos de dependencias: si no cambian, Docker reutiliza esta capa
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# La URL del backend se "graba" en el JS durante el build (Vite lee VITE_API_URL).
# Esta URL la usa el NAVEGADOR del usuario, por eso es la dirección pública del backend
# (en tu PC: http://localhost:8080). Se cambia desde docker-compose.yml (args).
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---------- Etapa 2: servir con nginx ----------
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
