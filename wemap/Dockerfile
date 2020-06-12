FROM node:12

# 앱 디렉터리 생성
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
# 프로덕션을 위한 코드를 빌드하는 경우
# RUN npm ci --only=production

COPY . .

EXPOSE 3300

# 런타임을 정의하는 CMD로 앱 실행하는 중요 명령어 정의
# 서버를 구동하도록 node server.js를 실행의 기본 npm start를 사용
CMD [ "node", "style_server.js" ]

