import MongodbMemoryServer from "mongodb-memory-server";

describe("User Accounts", () => {
    let mongod: MongodbMemoryServer;

    beforeAll(async () => {
        mongod = new MongodbMemoryServer();
        const uri = await mongod.getUri();
    });

    afterAll(async () => {
        await mongod.stop();
    });

    test("", async () => {
        const name = await mongod.getDbName();
        console.log(name);
    });
});
