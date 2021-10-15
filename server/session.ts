import connectRedis = require("connect-redis");
import expressSession = require("express-session");
import moment = require("moment");
import redis = require("redis");

const RedisStore = connectRedis(expressSession);

import { probablyUniqueString } from "../common/Toolbox";

export default async function(redisConnectionString?: string) {
  let store = null;

  if (redisConnectionString) {
    const sessionClient = redis.createClient(redisConnectionString);
    sessionClient.on("error", error => {
      console.error("Problem with Session store Redis Client: ");
      console.error(error);
    });
    store = new RedisStore({
      client: sessionClient
    });
  }

  const cookie = {
    maxAge: moment.duration(1, "weeks").asMilliseconds()
  };

  const session = expressSession({
    store: store || undefined,
    secret: process.env.SESSION_SECRET || probablyUniqueString(),
    resave: false,
    saveUninitialized: false,
    cookie
  });

  return session;
}
