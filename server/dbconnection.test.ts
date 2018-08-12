import MongodbMemoryServer from "mongodb-memory-server";
import { initialize, upsertUser } from "./dbconnection";

describe("User Accounts", () => {
    let mongod: MongodbMemoryServer;

    beforeAll(async () => {
        mongod = new MongodbMemoryServer();
        const uri = await mongod.getUri();
        initialize(uri);
    });

    afterAll(async () => {
        await mongod.stop();
    });

    test("Should initialize user with empty entity sets", async (done) => {
        const user = await upsertUser("patreonId", "accessKey", "refreshKey", "none");
        expect(user.encounters).toEqual({});
        expect(user.playercharacters).toEqual({});
        expect(user.statblocks).toEqual({});
        expect(user.spells).toEqual({});
        expect(user.persistentcharacters).toEqual({});
        done();
    });
});
