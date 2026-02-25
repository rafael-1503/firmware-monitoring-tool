FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

#REACT APP bauen
RUN npm run build

#NGINX
FROM nginx:1.27-alpine

#Openssl installieren
RUN apk add --no-cache openssl

#WORKDIR /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

#Gebaute REACT Dateien kopieren
COPY --from=build /app/dist /usr/share/nginx/html

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh


EXPOSE 443

CMD ["/docker-entrypoint.sh"]