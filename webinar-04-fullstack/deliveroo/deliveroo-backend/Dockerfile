FROM node:22-alpine AS development
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

RUN chown -R node:node /app

RUN mkdir -p /app/logs && chown node:node /app/logs

USER node

EXPOSE 3000
CMD ["npm", "run", "dev"]


FROM node:22-alpine AS production
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

RUN chown -R node:node /app

RUN mkdir -p /app/logs && chown node:node /app/logs

USER node

EXPOSE 3000
CMD ["node", "dist/server.js"]
