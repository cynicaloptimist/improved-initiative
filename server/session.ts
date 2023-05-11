import RedisStore from "connect-redis";
import { RequestHandler } from "express";
import Redis from "ioredis";
import expressSession = require("express-session");
import * as moment from "moment";


import { probablyUniqueString } from "../common/Toolbox";

export default async function(
  redisConnectionString?: string
): Promise<RequestHandler> {
  let store: RedisStore | null = null;

  if (redisConnectionString) {
    const sessionClient = new Redis(redisConnectionString, {
      tls: {
        rejectUnauthorized: false
      }
    });
    sessionClient.on("error", err => {
      console.warn("Session Store Redis Client:", err);
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
