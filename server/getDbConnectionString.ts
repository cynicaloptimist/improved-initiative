import { MongoMemoryServer } from "mongodb-memory-server";

let mongod;

export async function getDbConnectionString() {
  if (process.env.DB_CONNECTION_STRING) {
    return process.env.DB_CONNECTION_STRING;
  }

  console.log("No connection string found, initializing in-memory DB");
  mongod = await MongoMemoryServer.create();
  return await mongod.getUri();
}
