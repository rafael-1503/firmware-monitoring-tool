FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV PORT=3030
EXPOSE 3030

CMD ["npm", "start"]