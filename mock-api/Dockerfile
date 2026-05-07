FROM node:22-alpine

WORKDIR /app

COPY mock-api/package.json /app/package.json
COPY mock-api/db.json /app/db.json

RUN npm install

EXPOSE 3002

CMD ["./node_modules/.bin/json-server", "--host", "0.0.0.0", "--port", "3002", "db.json"]
