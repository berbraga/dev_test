# Usa uma imagem Node.js como base
FROM node:18

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia apenas os arquivos necessários para instalar dependências
COPY package*.json ./

# Instala as dependências
RUN npm install --production

# Copia o restante do código da aplicação
COPY . .

# Compila o TypeScript
RUN npm run build

# Exponha a porta que a aplicação utiliza
EXPOSE 3000

# Executa a aplicação
CMD ["npm", "start"]
