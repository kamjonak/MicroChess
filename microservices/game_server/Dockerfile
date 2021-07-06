FROM node:14
COPY . .
RUN npm install chess.js express express-session express-ejs-layouts cors ejs axios amqplib
CMD ["node", "game_server.js"]