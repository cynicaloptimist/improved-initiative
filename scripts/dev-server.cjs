require("dotenv").config();

const defaults = {
  NODE_ENV: "development",
  PORT: "3001",
  BASE_URL: "http://localhost:3000",
  DEFAULT_ACCOUNT_LEVEL: "free",
  SKIP_OPEN5E_API: "1"
};

for (const [name, value] of Object.entries(defaults)) {
  if (process.env[name] === undefined) {
    process.env[name] = value;
  }
}

require("../server/server.js");
