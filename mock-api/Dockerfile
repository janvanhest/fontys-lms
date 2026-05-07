FROM node:22-alpine

WORKDIR /app

COPY package.json /tmp/package.json
COPY mock-api/db.json /app/db.json

RUN npm install -g "json-server@$(node -p "JSON.parse(require('fs').readFileSync('/tmp/package.json', 'utf8')).devDependencies['json-server']")"

EXPOSE 3002

CMD ["json-server", "--host", "0.0.0.0", "--port", "3002", "db.json"]
