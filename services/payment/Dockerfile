FROM node:20-alpine
WORKDIR /app/services/payment
ENV NODE_ENV=production
COPY services/payment/package.json ./
RUN npm install --omit=dev
COPY services/payment ./
USER node
EXPOSE 3001
CMD ["node", "src/server.js"]
