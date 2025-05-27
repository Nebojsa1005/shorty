# Stage 1: build the app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run prod

# Stage 2: run the built app
FROM node:20-alpine

WORKDIR /home/node

COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm install --only=production

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
