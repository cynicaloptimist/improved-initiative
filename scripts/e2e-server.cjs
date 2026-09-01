process.env.NODE_ENV = "development";
process.env.PORT = "3100";
process.env.BASE_URL = "http://127.0.0.1:3100";
process.env.DEFAULT_ACCOUNT_LEVEL = "epicinitiative";
process.env.SKIP_OPEN5E_API = "1";

delete process.env.DB_CONNECTION_STRING;
delete process.env.REDIS_URL;
delete process.env.METRICS_DB_CONNECTION_STRING;

require("../server/server.js");
