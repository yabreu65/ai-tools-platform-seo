FROM node:18

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer puerto
EXPOSE 3001

# Ejecutar el script de desarrollo
CMD ["npm", "run", "dev"]
