FROM node:20-alpine
WORKDIR /app/services/consumer-app
ENV NODE_ENV=production
COPY services/consumer-app/package.json ./
RUN npm install --omit=dev
COPY services/consumer-app ./
USER node
EXPOSE 3002
CMD ["node", "src/server.js"]
