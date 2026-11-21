
# Etapa 1: construir React con Vite
FROM node:22-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./

# Instalar dependencias incluyendo Vite
RUN npm ci --include=dev

# Copiar el código fuente
COPY . .

# Variables de construcción
ARG VITE_BASE_PATH=/
ARG VITE_API_URL=http://localhost:8080

ENV VITE_BASE_PATH=${VITE_BASE_PATH}
ENV VITE_API_URL=${VITE_API_URL}

# Comprobar que Vite existe y compilar
RUN test -x node_modules/.bin/vite && npm run build

# Etapa 2: servidor Nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
