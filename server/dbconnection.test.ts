import { ObjectId } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import axios from "axios";
import { PersistentCharacter } from "../common/PersistentCharacter";
import { StatBlock } from "../common/StatBlock";
import { probablyUniqueString } from "../common/Toolbox";
import * as DB from "./dbconnection";
import {
  getPatreonAccountStatusChange,
  getPreviousPatreonWebhookAccountStatus,
  getPatreonWebhookAccountStatus,
  handleCurrentUser
} from "./patreon";
import { flushPendingPatreonConversion } from "./metrics";
import { AccountStatus, PendingPatreonConversion } from "./user";

describe("User Accounts", () => {
  let mongod: MongoMemoryServer;
  let uri;
  let userId: ObjectId;
  const googleAnalyticsId = process.env.GOOGLE_ANALYTICS_ID;
  const googleAnalyticsApiSecret = process.env.GOOGLE_ANALYTICS_API_SECRET;

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
    jest.restoreAllMocks();
    restoreEnvironmentVariable("GOOGLE_ANALYTICS_ID", googleAnalyticsId);
    restoreEnvironmentVariable(
      "GOOGLE_ANALYTICS_API_SECRET",
      googleAnalyticsApiSecret
    );
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

  test("Should clear Google Analytics client id for user", async () => {
    const user = await DB.upsertUser(
      probablyUniqueString(),
      AccountStatus.Pledge,
      ""
    );
    await DB.setGoogleAnalyticsClientId(user!._id, "123456.789012");

    expect(await DB.clearGoogleAnalyticsClientId(user!._id)).toBe(true);
    expect(
      (await DB.getUserByPatreonId(user!.patreonId))?.googleAnalyticsClientId
    ).toBeUndefined();
  });

  test("Should not record Patreon webhooks as user logins", async () => {
    const patreonId = probablyUniqueString();
    const user = await DB.upsertUser(patreonId, AccountStatus.None, "");
    const firstLogin = (user as any).mostRecentLogin;
    const firstPaidLogin = (user as any).mostRecentLoginWithPaidAccount;

    const updatedUser = await DB.upsertUserFromPatreonWebhook(
      patreonId,
      AccountStatus.Pledge,
      ""
    );

    expect((updatedUser as any).mostRecentLogin).toEqual(firstLogin);
    expect((updatedUser as any).mostRecentLoginWithPaidAccount).toEqual(
      firstPaidLogin
    );
  });

  test("Should queue and claim a Patreon conversion", async () => {
    const patreonId = probablyUniqueString();
    const user = await DB.upsertUser(patreonId, AccountStatus.Pledge, "");
    const conversion = buildPendingPatreonConversion();

    const queued = await DB.recordPatreonWebhookAccountStatus(
      patreonId,
      AccountStatus.Pledge,
      conversion
    );
    expect(queued).toBe(true);

    expect(await DB.claimPendingPatreonConversion(user!._id)).toBeNull();

    await DB.setGoogleAnalyticsClientId(user!._id, "123456.789012");
    const claimed = await DB.claimPendingPatreonConversion(user!._id);
    expect(claimed?.patreonConversionTracking?.pendingConversion?.id).toEqual(
      conversion.id
    );
    expect(
      claimed?.patreonConversionTracking?.pendingConversion?.sendingAtMs
    ).toBeDefined();
    expect(await DB.claimPendingPatreonConversion(user!._id)).toBeNull();
  });

  test("Should not replace a queued conversion from a duplicate webhook", async () => {
    const patreonId = probablyUniqueString();
    await DB.upsertUser(patreonId, AccountStatus.Pledge, "");
    const firstConversion = buildPendingPatreonConversion();
    const duplicateConversion = buildPendingPatreonConversion();

    expect(
      await DB.recordPatreonWebhookAccountStatus(
        patreonId,
        AccountStatus.Pledge,
        firstConversion
      )
    ).toBe(true);
    expect(
      await DB.recordPatreonWebhookAccountStatus(
        patreonId,
        AccountStatus.Pledge,
        duplicateConversion
      )
    ).toBe(false);

    const updatedUser = await DB.getUserByPatreonId(patreonId);
    expect(
      updatedUser?.patreonConversionTracking?.pendingConversion?.id
    ).toEqual(firstConversion.id);
  });

  test("Should release and complete a claimed Patreon conversion", async () => {
    const patreonId = probablyUniqueString();
    const user = await DB.upsertUser(patreonId, AccountStatus.Pledge, "");
    const conversion = buildPendingPatreonConversion();
    await DB.recordPatreonWebhookAccountStatus(
      patreonId,
      AccountStatus.Pledge,
      conversion
    );
    await DB.setGoogleAnalyticsClientId(user!._id, "123456.789012");

    await DB.claimPendingPatreonConversion(user!._id);
    await DB.releasePendingPatreonConversion(user!._id, conversion.id);
    expect(await DB.claimPendingPatreonConversion(user!._id)).not.toBeNull();

    expect(
      await DB.completePendingPatreonConversion(user!._id, conversion.id)
    ).toBe(true);
    const updatedUser = await DB.getUserByPatreonId(patreonId);
    expect(
      updatedUser?.patreonConversionTracking?.pendingConversion
    ).toBeUndefined();
    expect(
      updatedUser?.patreonConversionTracking?.lastSentConversionId
    ).toEqual(conversion.id);
  });

  test("Should send a queued Patreon conversion after client id capture", async () => {
    process.env.GOOGLE_ANALYTICS_ID = "G-TEST";
    process.env.GOOGLE_ANALYTICS_API_SECRET = "test-secret";
    jest.spyOn(console, "log").mockImplementation();
    const axiosPost = jest.spyOn(axios, "post").mockResolvedValue({});
    const patreonId = probablyUniqueString();
    const user = await DB.upsertUser(patreonId, AccountStatus.Pledge, "");
    const conversion = buildPendingPatreonConversion();
    await DB.recordPatreonWebhookAccountStatus(
      patreonId,
      AccountStatus.Pledge,
      conversion
    );
    await DB.setGoogleAnalyticsClientId(user!._id, "123456.789012");

    expect(await flushPendingPatreonConversion(user!._id)).toBe(true);
    expect(axiosPost).toHaveBeenCalledWith(
      expect.stringContaining("measurement_id=G-TEST"),
      expect.objectContaining({
        client_id: "123456.789012",
        events: expect.arrayContaining([
          expect.objectContaining({
            name: "close_convert_lead",
            params: expect.objectContaining({
              conversion_delivery_delay_ms: expect.any(Number),
              conversion_id: conversion.id,
              conversion_observed_at_ms: conversion.observedAtMs
            })
          }),
          expect.objectContaining({
            name: "patreon_subscription_started",
            params: expect.objectContaining({
              conversion_id: conversion.id
            })
          })
        ])
      }),
      expect.anything()
    );
    expect(
      (await DB.getUserByPatreonId(patreonId))?.patreonConversionTracking
        ?.pendingConversion
    ).toBeUndefined();
  });

  test("Should retry a queued Patreon conversion after send failure", async () => {
    process.env.GOOGLE_ANALYTICS_ID = "G-TEST";
    process.env.GOOGLE_ANALYTICS_API_SECRET = "test-secret";
    jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "warn").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();
    const axiosPost = jest
      .spyOn(axios, "post")
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({});
    const patreonId = probablyUniqueString();
    const user = await DB.upsertUser(patreonId, AccountStatus.Pledge, "");
    const conversion = buildPendingPatreonConversion();
    await DB.recordPatreonWebhookAccountStatus(
      patreonId,
      AccountStatus.Pledge,
      conversion
    );
    await DB.setGoogleAnalyticsClientId(user!._id, "123456.789012");

    expect(await flushPendingPatreonConversion(user!._id)).toBe(false);
    expect(
      (await DB.getUserByPatreonId(patreonId))?.patreonConversionTracking
        ?.pendingConversion?.sendingAtMs
    ).toBeUndefined();
    expect(await flushPendingPatreonConversion(user!._id)).toBe(true);
    expect(axiosPost).toHaveBeenCalledTimes(2);
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

    test("Treats pledge creation as new when OAuth updated status first", () => {
      expect(
        getPreviousPatreonWebhookAccountStatus(
          {
            accountStatus: AccountStatus.Pledge
          } as any,
          "members:pledge:create"
        )
      ).toEqual(AccountStatus.None);
    });

    test("Uses recorded webhook status when available", () => {
      expect(
        getPreviousPatreonWebhookAccountStatus(
          {
            accountStatus: AccountStatus.Epic,
            patreonConversionTracking: {
              webhookAccountStatus: AccountStatus.None
            }
          } as any,
          "members:pledge:update"
        )
      ).toEqual(AccountStatus.None);
    });
  });
});

function buildPendingPatreonConversion(): PendingPatreonConversion {
  return {
    id: probablyUniqueString(),
    previousAccountStatus: AccountStatus.None,
    accountStatus: AccountStatus.Pledge,
    observedAtMs: new Date().getTime(),
    webhookEvent: "members:pledge:create"
  };
}

function restoreEnvironmentVariable(
  name: string,
  value: string | undefined
): void {
  if (value == undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}
