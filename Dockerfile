# syntax=docker/dockerfile:1

# 1) ติดตั้ง dependencies (รวม dev) เพื่อ build frontend
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 2) Build frontend (Vite)
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3) Runtime image สำหรับ server + serve ไฟล์ที่ build แล้ว
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# ติดตั้งเฉพาะ production deps
COPY package*.json ./
RUN npm ci --omit=dev

# คัดลอกโค้ดฝั่ง server และไฟล์ build ของ frontend
COPY server ./server
COPY --from=build /app/dist ./dist

# คอนฟิกพื้นฐาน
ENV PORT=3001
# เปลี่ยนค่านี้ใน production ให้ปลอดภัย
ENV JWT_SECRET=please-change-in-production

EXPOSE 3001

# รัน Express server (จะเสิร์ฟไฟล์จาก dist ด้วย)
CMD ["node", "server/server.js"]