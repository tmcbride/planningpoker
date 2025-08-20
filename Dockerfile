FROM node:18

WORKDIR /app

RUN git clone https://github.com/tmcbride/planningpoker.git

WORKDIR /app/planningpoker

RUN npm install

RUN npm run build

EXPOSE 5001

CMD ["node", "server/server.js"]
