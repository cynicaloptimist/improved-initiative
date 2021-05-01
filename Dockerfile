FROM node:14
ARG NODE_ENV
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin
RUN mkdir -p /usr/src/app/
COPY . /usr/src/app/
RUN chown node:node -R /usr/src/app/

USER node
WORKDIR /usr/src/app
RUN npm install -g grunt
RUN npm install
RUN grunt --no-color copy

ENV NODE_ENV=${NODE_ENV}
RUN if [ "$NODE_ENV" = "production" ]; then grunt --no-color build_min; else grunt --no-color build_dev; fi

EXPOSE 80
CMD [ "node", "server/server.js" ]
