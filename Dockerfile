# --- Etapa 1: build ---
FROM node:20-alpine AS build

# La URL del backend se inyecta en tiempo de build (Vite). Las demás variables
# VITE_* (Supabase, GA) se toman del archivo .env presente en el contexto.
ARG VITE_BASE_API_URL
ENV VITE_BASE_API_URL=$VITE_BASE_API_URL

WORKDIR /app

# Instalación reproducible a partir del lockfile.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Etapa 2: servir con Nginx ---
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
