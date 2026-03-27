FROM node:22

WORKDIR /app

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Persist SQLite database in a mounted volume
RUN mkdir -p /app/data

EXPOSE 3001

CMD ["node", "index.js"]
