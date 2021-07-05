FROM node:14
COPY . .
RUN npm install body-parser express cors axios amqplib
CMD ["node", "matchmaking.js"]