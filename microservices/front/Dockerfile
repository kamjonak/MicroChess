FROM node:14
COPY . .
RUN npm install express express-session express-ejs-layouts connect-flash passport passport-local cors ejs axios amqplib
CMD ["node", "front.js"]