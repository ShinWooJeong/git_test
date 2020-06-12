FROM node:12

WORKDIR /usr/src/app

# COPY ../nodejs/node_modules/binaryjs/package*.json ./
# COPY ../nodejs/node_modules/canvas/package*.json ./
COPY package*.json ./
COPY ./WeMap.Node ./WeMap.Node

RUN npm install

#COPY . .

# RUN "start-me_WeMap.bat"

EXPOSE 3009

CMD [ "node", "./WeMap.Node/app.js" ]
#CMD [ "/bin/ls", "-al" ]