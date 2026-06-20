FROM node:20-alpine
WORKDIR /app/services/booking-service
ENV NODE_ENV=production
COPY services/booking-service/package.json ./
RUN npm install --omit=dev
COPY services/booking-service ./
USER node
EXPOSE 3004
CMD ["node", "src/server.js"]
