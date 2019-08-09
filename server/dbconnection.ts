import mongo = require("mongodb");

import * as _ from "lodash";
import { Listable, StoredListing } from "../common/Listable";
import { PersistentCharacter } from "../common/PersistentCharacter";
import { SavedEncounter } from "../common/SavedEncounter";
import { Spell } from "../common/Spell";
import { StatBlock } from "../common/StatBlock";
import { User } from "./user";

let connectionString: string;

export const initialize = async initialConnectionString => {
  if (!initialConnectionString) {
    console.log("No connection string found.");
    return;
  }

  connectionString = initialConnectionString;

  const client = new mongo.MongoClient(connectionString);
  await client.connect();
  client.close();
  return;
};

export async function upsertUser(
  patreonId: string,
  accountStatus: string,
  emailAddress: string
) {
  if (!connectionString) {
    console.error("No connection string found.");
    throw "No connection string found.";
  }

  const client = await new mongo.MongoClient(connectionString).connect();
  const db = client.db();
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
  client.close();
  return user;
}

export async function getAccount(userId: mongo.ObjectId) {
  const user = await getFullAccount(userId);

  const userWithListings = {
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
  if (!connectionString) {
    throw "No connection string found.";
  }

  const client = await new mongo.MongoClient(connectionString).connect();
  const db = client.db();
  const users = db.collection<User>("users");

  if (typeof userId === "string") {
    userId = new mongo.ObjectId(userId);
  }

  const user = await users.findOne({ _id: userId });
  if (user === null) {
    client.close();
    throw `User ${userId} not found.`;
  }

  await updatePersistentCharactersIfNeeded(user, users);
  client.close();

  const userAccount = {
    settings: user.settings,
    statblocks: user.statblocks,
    persistentcharacters: user.persistentcharacters || {},
    spells: user.spells,
    encounters: user.encounters
  };

  return userAccount;
}

export async function deleteAccount(userId: mongo.ObjectId) {
  if (!connectionString) {
    throw "No connection string found.";
  }

  const client = await new mongo.MongoClient(connectionString).connect();
  const db = client.db();
  const users = db.collection<User>("users");

  if (typeof userId === "string") {
    userId = new mongo.ObjectId(userId);
  }

  const result = await users.deleteOne({ _id: userId });
  client.close();
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
      Link: `/my/statblocks/${c.Id}`
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
      Link: `/my/spells/${c.Id}`
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
      Link: `/my/encounters/${c.Id}`
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
      Link: `/my/persistentcharacters/${c.Id}`
    };
  });
}

export async function setSettings(userId, settings) {
  if (!connectionString) {
    console.error("No connection string found.");
    throw "No connection string found.";
  }

  const client = await new mongo.MongoClient(connectionString).connect();
  const db = client.db();

  const users = db.collection<User>("users");
  const result = await users.updateOne({ _id: userId }, { $set: { settings } });
  client.close();
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
  if (!connectionString) {
    console.error("No connection string found.");
    throw "No connection string found.";
  }
  const client = await new mongo.MongoClient(connectionString).connect();
  const db = client.db();

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

  client.close();

  if (!user) {
    throw "User not found";
  }
  const entities = user[entityPath];
  if (entities === undefined) {
    throw `User has no ${entityPath} entities.`;
  }

  return entities[entityId];
}

export async function deleteEntity(
  entityPath: EntityPath,
  userId: mongo.ObjectId,
  entityId: string,
  callBack: (result: number) => void
) {
  if (!connectionString) {
    console.error("No connection string found.");
    throw "No connection string found.";
  }

  const client = await new mongo.MongoClient(connectionString).connect();
  const db = client.db();

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
  client.close();
  return;
}

export async function saveEntity<T extends Listable>(
  entityPath: EntityPath,
  userId: mongo.ObjectId,
  entity: T
) {
  if (!connectionString) {
    console.error("No connection string found.");
    throw "No connection string found.";
  }

  if (!entity.Id || !entity.Version) {
    throw "Entity missing Id or Version";
  }

  if (entity.Id.indexOf(".") > -1) {
    throw "Entity Id cannot contain .";
  }

  const client = await new mongo.MongoClient(connectionString).connect();
  const db = client.db();

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

  client.close();

  return result.modifiedCount;
}

export async function saveEntitySet<T extends Listable>(
  entityPath: EntityPath,
  userId: mongo.ObjectId,
  entities: T[],
  callBack: (result: number) => void
) {
  if (!connectionString) {
    console.error("No connection string found.");
    throw "No connection string found.";
  }

  for (const entity of entities) {
    if (!entity.Id || !entity.Version) {
      throw "Entity missing Id or Version";
    }
  }

  const client = await new mongo.MongoClient(connectionString).connect();
  const db = client.db();

  const users = db.collection<User>("users");

  if (typeof userId === "string") {
    userId = new mongo.ObjectId(userId);
  }

  const result = await users.findOne({ _id: userId }).then(u => {
    if (u == null) {
      throw "User ID not found: " + userId;
    }

    const updatedEntities = u[entityPath] || {};
    for (const entity of entities) {
      updatedEntities[entity.Id] = entity;
    }
    return users.updateOne(
      { _id: userId },
      {
        $set: {
          [`${entityPath}`]: updatedEntities
        }
      }
    );
  });
  client.close();
  callBack(result.modifiedCount);
}
