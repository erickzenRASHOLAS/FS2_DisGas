
# Etapa 1: construir la aplicación React
FROM node:22-alpine AS build

WORKDIR /app

# Copiar dependencias
COPY package*.json ./
RUN npm ci

# Copiar el código del frontend
COPY . .

# Variables disponibles durante la compilación de Vite
ARG VITE_BASE_PATH=/
ARG VITE_API_URL=http://localhost:8080

ENV VITE_BASE_PATH=${VITE_BASE_PATH}
ENV VITE_API_URL=${VITE_API_URL}

# Generar archivos de producción
RUN npm run build

# Etapa 2: servir React mediante Nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
