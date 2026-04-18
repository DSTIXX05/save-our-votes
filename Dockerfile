FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --include=dev

COPY . .

# Build TypeScript and then remove dev dependencies from the final image.
RUN npm run build && npm prune --omit=dev && npm cache clean --force

ENV NODE_ENV=production
RUN mkdir -p uploads

EXPOSE 3000

CMD ["node", "dist/server.js"]
