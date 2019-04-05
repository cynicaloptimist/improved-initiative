import dbSession = require("connect-mongodb-session");
import express = require("express");
import expressSession = require("express-session");
import moment = require("moment");

import { probablyUniqueString } from "../common/Toolbox";

export default async function(
  app: express.Application,
  dbConnectionString?: string
) {
  const MongoDBStore = dbSession(expressSession);
  let store = null;

  if (dbConnectionString) {
    store = new MongoDBStore({
      uri: dbConnectionString,
      collection: "sessions"
    });
  }

  const cookie = {
    maxAge: moment.duration(1, "weeks").asMilliseconds()
  };

  app.use(
    expressSession({
      store: store || undefined,
      secret: process.env.SESSION_SECRET || probablyUniqueString(),
      resave: false,
      saveUninitialized: false,
      cookie
    })
  );
}
