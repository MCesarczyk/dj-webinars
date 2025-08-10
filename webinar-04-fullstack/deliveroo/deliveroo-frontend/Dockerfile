FROM node:22-alpine AS development
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

RUN mkdir -p /app/.angular/cache && \
    chown -R node:node /app /app/.angular /app/node_modules

USER node

EXPOSE 4200
CMD ["npm", "start", "--", "--host", "0.0.0.0"]


FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

RUN mkdir -p /app/.angular/cache && \
    chown -R node:node /app /app/.angular /app/node_modules

USER node


FROM nginx:alpine AS production

COPY --from=build /app/dist/deliveroo-frontend/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R node:node /usr/share/nginx/html

USER node

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
