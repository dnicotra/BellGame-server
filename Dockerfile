FROM node:latest

ENV PORT 8080
ENV npm_config_cache /home/node/app/.npm

WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install
# run this for production
# npm ci --only=production

COPY . .
RUN npm cache clean --force

EXPOSE 8080

CMD [ "npm", "start" ]