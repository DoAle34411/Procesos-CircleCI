FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Si tu app se ejecuta con "npm run dev" o "npm start"
EXPOSE 3000

CMD ["npm", "run", "dev"]
