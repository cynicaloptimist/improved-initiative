import mongo = require("mongodb");

import * as _ from "lodash";
import { Listable, StoredListing } from "../common/Listable";
import { PersistentCharacter } from "../common/PersistentCharacter";
import { SavedEncounter } from "../common/SavedEncounter";
import { Spell } from "../common/Spell";
import { StatBlock } from "../common/StatBlock";
import { AccountStatus, User } from "./user";

let mongoClient: mongo.MongoClient;

export const initialize = async connectionString => {
  if (!connectionString) {
    console.log("No connection string found.");
    return;
  }

  mongoClient = new mongo.MongoClient(connectionString);
  await mongoClient.connect();
  return;
};

export const close = async () => await mongoClient.close();

export async function upsertUser(
  patreonId: string,
  accountStatus: AccountStatus,
  emailAddress: string
) {
  if (!mongoClient) {
    console.error("No mongo client initialized");
    throw "No mongo client initialized";
  }

  const db = mongoClient.db();
  const users = await db.collection<User>("users");
  const result = await users.findOneAndUpdate(
    {
      patreonId
    },
    {
      $set: {
        patreonId,
        accountStatus,
        emailAddress
      },
      $setOnInsert: {
        statblocks: {},
        persistentcharacters: {},
        spells: {},
        encounters: {},
        settings: {}
      }
    },
    {
      upsert: true,
      returnOriginal: false
    }
  );
  const user = result.value;
  return user;
}

export async function getAccount(userId: mongo.ObjectId) {
  const user = await getFullAccount(userId);
  if (!user) {
    return null;
  }

  const userWithListings = {
    accountStatus: user.accountStatus,
    settings: user.settings,
    statblocks: getStatBlockListings(user.statblocks),
    persistentcharacters: getPersistentCharacterListings(
      user.persistentcharacters
    ),
    spells: getSpellListings(user.spells),
    encounters: getEncounterListings(user.encounters)
  };

  return userWithListings;
}

export async function getFullAccount(userId: mongo.ObjectId) {
  if (!mongoClient) {
    throw "No mongo client initialized";
  }

  const db = mongoClient.db();
  const users = db.collection<User>("users");

  if (typeof userId === "string") {
    userId = new mongo.ObjectId(userId);
  }

  const user = await users.findOne({ _id: userId });
  if (user === null) {
    return null;
  }

  await updatePersistentCharactersIfNeeded(user, users);

  const userAccount = {
    accountStatus: user.accountStatus,
    settings: user.settings,
    statblocks: user.statblocks,
    persistentcharacters: user.persistentcharacters || {},
    spells: user.spells,
    encounters: user.encounters
  };

  return userAccount;
}

export async function deleteAccount(userId: mongo.ObjectId) {
  if (!mongoClient) {
    throw "No mongo client initialized";
  }

  const db = mongoClient.db();
  const users = db.collection<User>("users");

  if (typeof userId === "string") {
    userId = new mongo.ObjectId(userId);
  }

  const result = await users.deleteOne({ _id: userId });
  return result.deletedCount;
}

async function updatePersistentCharactersIfNeeded(
  user: User,
  users: mongo.Collection<User>
) {
  if (
    user.persistentcharacters != undefined &&
    !_.isEmpty(user.persistentcharacters)
  ) {
    return false;
  }

  if (!user.playercharacters) {
    return false;
  }

  const persistentcharacters = _.mapValues(
    user.playercharacters,
    statBlockUnsafe => {
      const statBlock = { ...StatBlock.Default(), ...statBlockUnsafe };
      return PersistentCharacter.Initialize(statBlock);
    }
  );

  await users.updateOne({ _id: user._id }, { $set: { persistentcharacters } });
  user.persistentcharacters = persistentcharacters;

  return true;
}

function getStatBlockListings(statBlocks: {
  [key: string]: {};
}): StoredListing[] {
  return Object.keys(statBlocks).map(key => {
    const c = { ...StatBlock.Default(), ...statBlocks[key] };
    return {
      Name: c.Name,
      Id: c.Id,
      Path: c.Path,
      SearchHint: StatBlock.GetSearchHint(c),
      Metadata: StatBlock.GetMetadata(c),
      Version: c.Version,
      Link: `/my/statblocks/${c.Id}`,
      LastUpdateMs: c.LastUpdateMs || 0
    };
  });
}

function getSpellListings(spells: { [key: string]: {} }): StoredListing[] {
  return Object.keys(spells).map(key => {
    const c = { ...Spell.Default(), ...spells[key] };
    return {
      Name: c.Name,
      Id: c.Id,
      Path: c.Path,
      SearchHint: Spell.GetSearchHint(c),
      Metadata: Spell.GetMetadata(c),
      Version: c.Version,
      Link: `/my/spells/${c.Id}`,
      LastUpdateMs: c.LastUpdateMs || 0
    };
  });
}

function getEncounterListings(encounters: {
  [key: string]: {};
}): StoredListing[] {
  return Object.keys(encounters).map(key => {
    const c = {
      ...SavedEncounter.Default(),
      ...encounters[key]
    };
    return {
      Name: c.Name,
      Id: c.Id,
      Path: c.Path,
      SearchHint: SavedEncounter.GetSearchHint(c),
      Metadata: {},
      Version: c.Version,
      Link: `/my/encounters/${c.Id}`,
      LastUpdateMs: c.LastUpdateMs || 0
    };
  });
}

function getPersistentCharacterListings(persistentCharacters: {
  [key: string]: {};
}): StoredListing[] {
  return Object.keys(persistentCharacters).map(key => {
    const c = {
      ...PersistentCharacter.Default(),
      ...persistentCharacters[key]
    };
    return {
      Name: c.Name,
      Id: c.Id,
      Path: c.Path,
      SearchHint: PersistentCharacter.GetSearchHint(c),
      Metadata: PersistentCharacter.GetMetadata(c),
      Version: c.Version,
      Link: `/my/persistentcharacters/${c.Id}`,
      LastUpdateMs: c.LastUpdateMs || 0
    };
  });
}

export async function setSettings(userId, settings) {
  if (!mongoClient) {
    console.error("No mongo client initialized");
    throw "No mongo client initialized";
  }

  if (typeof userId === "string") {
    userId = new mongo.ObjectId(userId);
  }

  const db = mongoClient.db();

  const users = db.collection<User>("users");
  const result = await users.updateOne({ _id: userId }, { $set: { settings } });
  return result.modifiedCount;
}

export type EntityPath =
  | "statblocks"
  | "spells"
  | "encounters"
  | "persistentcharacters"
  | "playercharacters";

export async function getEntity(
  entityPath: EntityPath,
  userId: mongo.ObjectId,
  entityId: string
) {
  if (!mongoClient) {
    console.error("No mongo client initialized");
    throw "No mongo client initialized";
  }

  const db = mongoClient.db();

  if (typeof userId === "string") {
    userId = new mongo.ObjectId(userId);
  }

  const user = await db.collection<User>("users").findOne(
    { _id: userId },
    {
      fields: {
        [`${entityPath}.${entityId}`]: true
      }
    }
  );

  if (!user) {
    return null;
  }
  const entities = user[entityPath];
  if (entities === undefined) {
    return null;
  }

  return entities[entityId];
}

export async function deleteEntity(
  entityPath: EntityPath,
  userId: mongo.ObjectId,
  entityId: string,
  callBack: (result: number) => void
) {
  if (!mongoClient) {
    console.error("No mongo client initialized");
    throw "No mongo client initialized";
  }

  const db = mongoClient.db();

  const users = db.collection<User>("users");

  if (typeof userId === "string") {
    userId = new mongo.ObjectId(userId);
  }

  const result = await users.updateOne(
    { _id: userId },
    {
      $unset: {
        [`${entityPath}.${entityId}`]: ""
      }
    }
  );

  callBack(result.modifiedCount);
  return;
}

export async function saveEntity<T extends Listable>(
  entityPath: EntityPath,
  userId: mongo.ObjectId,
  entity: T
) {
  if (!mongoClient) {
    console.error("No mongo client initialized");
    throw "No mongo client initialized";
  }

  if (!entity.Id || !entity.Version) {
    throw "Entity missing Id or Version";
  }

  if (entity.Id.indexOf(".") > -1) {
    throw "Entity Id cannot contain .";
  }

  const db = mongoClient.db();

  if (typeof userId === "string") {
    userId = new mongo.ObjectId(userId);
  }

  const result = await db.collection("users").updateOne(
    { _id: userId },
    {
      $set: {
        [`${entityPath}.${entity.Id}`]: entity
      }
    }
  );

  return result.modifiedCount;
}

export async function saveEntitySet<T extends Listable>(
  entityPath: EntityPath,
  userId: mongo.ObjectId,
  entities: T[]
) {
  if (!mongoClient) {
    console.error("No mongo client initialized");
    throw "No mongo client initialized";
  }

  for (const entity of entities) {
    if (!entity.Id || !entity.Version) {
      throw "Entity missing Id or Version";
    }
  }

  const db = mongoClient.db();

  const users = db.collection<User>("users");

  if (typeof userId === "string") {
    userId = new mongo.ObjectId(userId);
  }

  const user = await users.findOne({ _id: userId });
  if (user == null) {
    return null;
  }

  const updatedEntities = user[entityPath] || {};
  for (const entity of entities) {
    updatedEntities[entity.Id] = entity;
  }

  const result = await users.updateOne(
    { _id: userId },
    {
      $set: {
        [`${entityPath}`]: updatedEntities
      }
    }
  );

  if (!result) {
    return 0;
  }

  return result.matchedCount;
}
