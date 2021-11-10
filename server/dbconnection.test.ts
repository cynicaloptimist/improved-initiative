import { ObjectID } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { PersistentCharacter } from "../common/PersistentCharacter";
import { StatBlock } from "../common/StatBlock";
import { probablyUniqueString } from "../common/Toolbox";
import * as DB from "./dbconnection";
import { handleCurrentUser } from "./patreon";
import { AccountStatus } from "./user";

describe("User Accounts", () => {
  let mongod: MongoMemoryServer;
  let uri;
  let userId: ObjectID;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    uri = await mongod.getUri();
  });

  beforeEach(async () => {
    await DB.initialize(uri);
    const user = await DB.upsertUser(
      probablyUniqueString(),
      AccountStatus.Pledge,
      ""
    );
    userId = user._id;
  });

  afterEach(async () => {
    await DB.close();
  });

  afterAll(async () => {
    await mongod.stop();
  });

  test("Should initialize user with empty entity sets", async done => {
    const user = await DB.getAccount(userId);
    expect(user.encounters).toHaveLength(0);
    expect(user).not.toHaveProperty("playercharacters");
    expect(user.statblocks).toHaveLength(0);
    expect(user.spells).toHaveLength(0);
    expect(user.persistentcharacters).toHaveLength(0);
    done();
  });

  test("Should save statblocks", async () => {
    const statBlock: StatBlock = {
      ...StatBlock.Default(),
      Name: "Test StatBlock",
      Id: "playerCharacterId"
    };
    await DB.saveEntity("statblocks", userId, statBlock);
    const savedStatBlock = await DB.getEntity(
      "statblocks",
      userId,
      statBlock.Id
    );
    expect(savedStatBlock).toEqual(statBlock);
  });

  test("Should copy playercharacters as persistentcharacters", async done => {
    const playerCharacterStatBlock: StatBlock = {
      ...StatBlock.Default(),
      Name: "Test Player Character",
      Id: "playerCharacterId"
    };
    await DB.saveEntity("playercharacters", userId, playerCharacterStatBlock);
    const user = await DB.getAccount(userId);
    expect(user).not.toHaveProperty("playercharacters");
    expect(user.persistentcharacters).toHaveLength(1);
    const persistentCharacterListing = user.persistentcharacters[0];
    expect(persistentCharacterListing.Name).toBe(playerCharacterStatBlock.Name);

    done();
  });

  test("Should save generated persistentcharacters back to account", async done => {
    const playerCharacterStatBlock: StatBlock = {
      ...StatBlock.Default(),
      Name: "Test Player Character",
      Id: "playerCharacterId",
      Type: "Test Type"
    };

    await DB.saveEntity("playercharacters", userId, playerCharacterStatBlock);

    const user = await DB.getAccount(userId);

    const persistentCharacterListing = user.persistentcharacters[0];
    const savedPersistentCharacter = (await DB.getEntity(
      "persistentcharacters",
      userId,
      persistentCharacterListing.Id
    )) as PersistentCharacter;

    expect(savedPersistentCharacter.StatBlock.Type).toEqual(
      playerCharacterStatBlock.Type
    );
    done();
  });

  describe("Handle user account response from Patreon API", () => {
    test("Epic Initiative", async () => {
      const apiResponse = require("./api_response_epic_account.json");
      const req: any = { query: { state: "encounterId" }, session: {} };
      const res: any = { redirect: jest.fn() };
      await handleCurrentUser(req, res, apiResponse);
      const user = await DB.getAccount(req.session.userId);
      expect(user.accountStatus).toEqual("epic");
    });

    test("No Pledge", async () => {
      const apiResponse = require("./api_response_no_pledge.json");
      const req: any = { query: { state: "encounterId" }, session: {} };
      const res: any = { redirect: jest.fn() };
      await handleCurrentUser(req, res, apiResponse);
      const user = await DB.getAccount(req.session.userId);
      expect(user.accountStatus).toEqual("none");
    });

    test("Declined Pledge", async () => {
      const apiResponse = require("./api_response_declined_pledge.json");
      const req: any = { query: { state: "encounterId" }, session: {} };
      const res: any = { redirect: jest.fn() };
      await handleCurrentUser(req, res, apiResponse);
      const user = await DB.getAccount(req.session.userId);
      expect(user.accountStatus).toEqual("none");
    });
  });
});
