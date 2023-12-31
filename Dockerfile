FROM node:20

ENV PORT 8080
ENV npm_config_cache /home/node/app/.npm

WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm ci
# run this for production
# npm ci --only=production

COPY . .

EXPOSE 8080

CMD [ "npm", "start" ]