FROM node:18

WORKDIR /app

COPY . .

COPY .env .

COPY .env ./client

RUN npm install

RUN npm run build

EXPOSE 5001

CMD ["node", "server/server.js"]
