FROM node:22.12-alpine

WORKDIR /app

RUN npm install -g json-server@1.0.0-beta.15

COPY db.json /app/db.json

EXPOSE 3002

CMD ["json-server", "--host", "0.0.0.0", "--port", "3002", "db.json"]
