FROM node:20-alpine AS build

ARG VITE_BASE_API_URL
ENV VITE_BASE_API_URL=$VITE_BASE_API_URL

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos de dependencias y otros archivos necesarios
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el código fuente a la imagen
COPY . .

# Construir la aplicación para producción utilizando openssl-legacy-provider
RUN npm run build

# Etapa 2: Servir la aplicación utilizando un servidor Nginx
FROM nginx:alpine

# Copiar el código compilado desde la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx si es necesario
# COPY nginx.conf /etc/nginx/nginx.conf

# Exponer el puerto en el contenedor
EXPOSE 80

# Iniciar Nginx cuando se inicie el contenedor
CMD ["nginx", "-g", "daemon off;"]