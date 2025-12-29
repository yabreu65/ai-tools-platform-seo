FROM node:18

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos
COPY . .

# Instala dependencias
RUN npm install

# Genera el build
RUN npm run build

# Expone el puerto
EXPOSE 3000

# Comando para desarrollo
CMD ["npm", "run", "dev"]