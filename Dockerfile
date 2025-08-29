FROM node:18-alpine

WORKDIR /app

# Install production dependencies first for better caching
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY src ./src
COPY config.js ./
COPY env.example ./

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "src/index.js"]


