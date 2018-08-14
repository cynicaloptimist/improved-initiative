import { MongoClient } from "mongodb";
import MongodbMemoryServer from "mongodb-memory-server";
import { StatBlock } from "../common/StatBlock";
import { probablyUniqueString } from "../common/Toolbox";
import * as DB from "./dbconnection";
import { User } from "./user";

describe("User Accounts", () => {
    let mongod: MongodbMemoryServer;
    let uri;

    beforeAll(async () => {
        mongod = new MongodbMemoryServer();
        uri = await mongod.getUri();
        DB.initialize(uri);
    }, 60000);

    afterAll(async () => {
        await mongod.stop();
    });

    test("Should initialize user with empty entity sets", async (done) => {
        const user = await DB.upsertUser(probablyUniqueString(), "accessKey", "refreshKey", "pledge") as User;
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

    test("Should copy playercharacters as persistentcharacters", async (done) => {
        const playerCharacterStatBlock = {
            ...StatBlock.Default(),
            Name: "Test Player Character",
            Id: "playerCharacterId"
        };
        const insertedUser = await DB.upsertUser(probablyUniqueString(), "accessKey", "refreshKey", "pledge") as User;
        const userId = insertedUser._id;
        await DB.saveEntity("playercharacters", userId, playerCharacterStatBlock);
        const user = await DB.getAccount(userId);
        expect(user.playercharacters).toHaveLength(1);
        expect(user.persistentcharacters).toHaveLength(1);
        const persistentCharacterName = user.persistentcharacters[0].Name;
        expect(persistentCharacterName).toBe(playerCharacterStatBlock.Name);
        done();
    });
});
