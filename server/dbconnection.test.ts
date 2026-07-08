import { ObjectId } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { PersistentCharacter } from "../common/PersistentCharacter";
import { StatBlock } from "../common/StatBlock";
import { probablyUniqueString } from "../common/Toolbox";
import * as DB from "./dbconnection";
import {
  getPatreonAccountStatusChange,
  getPatreonWebhookAccountStatus,
  handleCurrentUser
} from "./patreon";
import { AccountStatus } from "./user";

describe("User Accounts", () => {
  let mongod: MongoMemoryServer;
  let uri;
  let userId: ObjectId;

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
    userId = user!._id;
  });

  afterEach(async () => {
    await DB.close();
  });

  afterAll(async () => {
    await mongod.stop();
  });

  test("Should initialize user with empty entity sets", async () => {
    const user = await DB.getAccount(userId);
    expect(user?.encounters).toHaveLength(0);
    expect(user).not.toHaveProperty("playercharacters");
    expect(user?.statblocks).toHaveLength(0);
    expect(user?.spells).toHaveLength(0);
    expect(user?.persistentcharacters).toHaveLength(0);
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

  test("Should store Google Analytics client id for user", async () => {
    const patreonId = probablyUniqueString();
    const user = await DB.upsertUser(patreonId, AccountStatus.Pledge, "");

    await DB.setGoogleAnalyticsClientId(user!._id, "123456.789012");
    await DB.upsertUser(patreonId, AccountStatus.Epic, "");

    const updatedUser = await DB.getUserByPatreonId(patreonId);
    expect(updatedUser?.googleAnalyticsClientId).toEqual("123456.789012");
  });

  test("Should copy playercharacters as persistentcharacters", async () => {
    const playerCharacterStatBlock: StatBlock = {
      ...StatBlock.Default(),
      Name: "Test Player Character",
      Id: "playerCharacterId"
    };
    await DB.saveEntity("playercharacters", userId, playerCharacterStatBlock);
    const user = await DB.getAccount(userId);
    expect(user).not.toHaveProperty("playercharacters");
    expect(user?.persistentcharacters).toHaveLength(1);
    const persistentCharacterListing = user?.persistentcharacters[0];
    expect(persistentCharacterListing?.Name).toBe(
      playerCharacterStatBlock.Name
    );
  });

  test("Should save generated persistentcharacters back to account", async () => {
    const playerCharacterStatBlock: StatBlock = {
      ...StatBlock.Default(),
      Name: "Test Player Character",
      Id: "playerCharacterId",
      Type: "Test Type"
    };

    await DB.saveEntity("playercharacters", userId, playerCharacterStatBlock);

    const user = await DB.getAccount(userId);

    const persistentCharacterListing = user?.persistentcharacters[0];
    const savedPersistentCharacter = (await DB.getEntity(
      "persistentcharacters",
      userId,
      persistentCharacterListing!.Id
    )) as PersistentCharacter;

    expect(savedPersistentCharacter.StatBlock.Type).toEqual(
      playerCharacterStatBlock.Type
    );
  });

  describe("Handle user account response from Patreon API", () => {
    test("Epic Initiative", async () => {
      const apiResponse = require("./api_response_epic_account.json");
      const req: any = { query: { state: "encounterId" }, session: {} };
      const res: any = { redirect: jest.fn() };
      await handleCurrentUser(req, res, apiResponse);
      const user = await DB.getAccount(req.session.userId);
      expect(user?.accountStatus).toEqual(AccountStatus.Epic);
    });

    test("No Pledge", async () => {
      const apiResponse = require("./api_response_no_pledge.json");
      const req: any = { query: { state: "encounterId" }, session: {} };
      const res: any = { redirect: jest.fn() };
      await handleCurrentUser(req, res, apiResponse);
      const user = await DB.getAccount(req.session.userId);
      expect(user?.accountStatus).toEqual("none");
    });

    test("Declined Pledge", async () => {
      const apiResponse = require("./api_response_declined_pledge.json");
      const req: any = { query: { state: "encounterId" }, session: {} };
      const res: any = { redirect: jest.fn() };
      await handleCurrentUser(req, res, apiResponse);
      const user = await DB.getAccount(req.session.userId);
      expect(user?.accountStatus).toEqual("none");
    });
  });

  describe("Patreon account status change classification", () => {
    test("Paid account status starts are conversions", () => {
      expect(
        getPatreonAccountStatusChange(AccountStatus.None, AccountStatus.Pledge)
      ).toEqual("started");
    });

    test("Paid account status cancellations are cancellations", () => {
      expect(
        getPatreonAccountStatusChange(AccountStatus.Epic, AccountStatus.None)
      ).toEqual("cancelled");
    });

    test("Paid tier moves are changes", () => {
      expect(
        getPatreonAccountStatusChange(AccountStatus.Pledge, AccountStatus.Epic)
      ).toEqual("changed");
    });

    test("Unchanged paid account statuses are ignored", () => {
      expect(
        getPatreonAccountStatusChange(AccountStatus.Epic, AccountStatus.Epic)
      ).toBeNull();
    });
  });

  describe("Patreon webhook account status", () => {
    test("Uses currently entitled tiers for pledge create events", () => {
      expect(
        getPatreonWebhookAccountStatus(
          "patreonId",
          [{ id: "1937132" }],
          "members:pledge:create"
        )
      ).toEqual(AccountStatus.Epic);
    });

    test("Revokes account access for pledge delete events", () => {
      expect(
        getPatreonWebhookAccountStatus(
          "patreonId",
          [{ id: "1937132" }],
          "members:pledge:delete"
        )
      ).toEqual(AccountStatus.None);
    });

    test("Returns no account access for empty entitled tiers", () => {
      expect(
        getPatreonWebhookAccountStatus("patreonId", [], "members:pledge:update")
      ).toEqual(AccountStatus.None);
    });
  });
});
