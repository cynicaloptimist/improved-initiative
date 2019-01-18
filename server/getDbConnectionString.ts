import MongodbMemoryServer from "mongodb-memory-server";

let mongod;

export async function getDbConnectionString() {
  if (process.env.DB_CONNECTION_STRING) {
    return process.env.DB_CONNECTION_STRING;
  }

  console.log("No connection string found, initializing in-memory DB");
  mongod = new MongodbMemoryServer();
  return await mongod.getUri();
}
