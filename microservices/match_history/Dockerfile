FROM node:14
COPY . .
RUN npm install express cors axios amqplib mongoose
CMD ["node", "match_history.js"]