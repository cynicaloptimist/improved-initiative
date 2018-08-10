import MongodbMemoryServer from "mongodb-memory-server";

describe("", () => {
    test("", async (done) => {
        const mongod = new MongodbMemoryServer();
        const name = await mongod.getDbName();
        console.log(name);
        await mongod.stop();
        done();
    });
});
