import { ObjectID } from "mongodb";
import MongodbMemoryServer from "mongodb-memory-server";
import { PersistentCharacter } from "../common/PersistentCharacter";
import { StatBlock } from "../common/StatBlock";
import { probablyUniqueString } from "../common/Toolbox";
import * as DB from "./dbconnection";
import { User } from "./user";

describe("User Accounts", () => {
  let mongod: MongodbMemoryServer;
  let uri;
  let userId: ObjectID;

  beforeAll(async () => {
    mongod = new MongodbMemoryServer();
    uri = await mongod.getUri();
    DB.initialize(uri);
  }, 60000);

  beforeEach(async () => {
    const user = await DB.upsertUser(probablyUniqueString(), "pledge");
    userId = user._id;
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
});
