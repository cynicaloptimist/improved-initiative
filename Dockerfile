FROM node:carbon
ARG NODE_ENV
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin
RUN npm install -g grunt

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

COPY . .
RUN grunt --no-color copy

ENV NODE_ENV=${NODE_ENV}
RUN if [ "$NODE_ENV" = "production" ]; then grunt --no-color build_min; else grunt --no-color build_dev; fi

EXPOSE 80
CMD [ "node", "server/server.js" ]
