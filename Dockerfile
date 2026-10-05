FROM node:20-alpine AS base
WORKDIR /app

# Bağımlılıkları yükle
COPY package.json package-lock.json ./
RUN npm ci

# Kodları kopyala ve Prisma'yı derle
COPY . .
RUN npx prisma generate
RUN npm run build

# Sadece production için gerekenleri alıp çalıştır
EXPOSE 3000
ENV PORT=3000
CMD ["npm", "start"]
