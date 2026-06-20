FROM node:20-alpine
WORKDIR /app/services/driver-app
ENV NODE_ENV=production
COPY services/driver-app/package.json ./
RUN npm install --omit=dev
COPY services/driver-app ./
USER node
EXPOSE 3003
CMD ["node", "src/server.js"]
