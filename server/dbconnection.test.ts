import { MongoClient } from "mongodb";
import MongodbMemoryServer from "mongodb-memory-server";
import { StatBlock } from "../common/StatBlock";
import { probablyUniqueString } from "../common/Toolbox";
import * as DB from "./dbconnection";

describe("User Accounts", () => {
    let mongod: MongodbMemoryServer;
    let uri;

    beforeAll(async () => {
        mongod = new MongodbMemoryServer();
        uri = await mongod.getUri();
        DB.initialize(uri);
    });

    afterAll(async () => {
        await mongod.stop();
    });

    test("Should initialize user with empty entity sets", async (done) => {
        const user = await DB.upsertUser(probablyUniqueString(), "accessKey", "refreshKey", "pledge");
        expect(user.encounters).toEqual({});
        expect(user.playercharacters).toEqual({});
        expect(user.statblocks).toEqual({});
        expect(user.spells).toEqual({});
        expect(user.persistentcharacters).toEqual({});
        done();
    });

    test("baseline", async (done) => {
        expect.assertions(1);
        const db = await MongoClient.connect(uri);
        const test = await db.collection("test").insertOne({ "foo": "bar" });
        const id = test.insertedId;
        const lookup = await db.collection("test").findOne({ _id: id });
        expect(lookup.foo).toEqual("bar");
        done();
    });
});
