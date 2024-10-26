# frontend/Dockerfile

FROM node:14

WORKDIR /app

COPY package.json /app/
COPY package-lock.json /app/

ENV NODE_OPTIONS=--max-old-space-size=8192

RUN npm install

COPY . /app/

EXPOSE 3000

CMD ["npm", "start"]

