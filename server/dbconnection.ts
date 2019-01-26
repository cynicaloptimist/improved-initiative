import mongo = require("mongodb");
const client = mongo.MongoClient;

import * as _ from "lodash";
import { CombatantState } from "../common/CombatantState";
import { DefaultEncounterState } from "../common/EncounterState";
import { Listable, ServerListing } from "../common/Listable";
import {
  DefaultPersistentCharacter,
  InitializeCharacter
} from "../common/PersistentCharacter";
import { Spell } from "../common/Spell";
import { StatBlock } from "../common/StatBlock";
import * as L from "./library";
import { User } from "./user";

let connectionString;

export const initialize = async initialConnectionString => {
  if (!initialConnectionString) {
    console.log("No connection string found.");
    return;
  }

  connectionString = initialConnectionString;

  const db = await client.connect(connectionString);
  db.close();
  return;
};

export async function upsertUser(
  patreonId: string,
  accessKey: string,
  refreshKey: string,
  accountStatus: string
) {
  if (!connectionString) {
    console.error("No connection string found.");
    throw "No connection string found.";
  }

  return client.connect(connectionString).then((db: mongo.Db) => {
    const users = db.collection<User>("users");
    return users
      .findOneAndUpdate(
        {
          patreonId
        },
        {
          $set: {
            patreonId,
            accessKey,
            refreshKey,
            accountStatus
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
          upsert: true
        }
      )
      .then(res => {
        return users.findOne({
          patreonId
        });
      });
  });
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

  const db = await client.connect(connectionString);
  const users = db.collection<User>("users");
  const user = await users.findOne({ _id: userId });
  if (user === null) {
    db.close();
    throw `User ${userId} not found.`;
  }

  await updatePersistentCharactersIfNeeded(user, users);
  db.close();

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

  const db = await client.connect(connectionString);
  const users = db.collection<User>("users");
  const result = await users.deleteOne({ _id: userId });
  db.close();
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
      return InitializeCharacter(statBlock);
    }
  );

  await users.updateOne({ _id: user._id }, { $set: { persistentcharacters } });
  user.persistentcharacters = persistentcharacters;

  return true;
}

function getStatBlockListings(statBlocks: {
  [key: string]: {};
}): ServerListing[] {
  return Object.keys(statBlocks).map(key => {
    const c = { ...StatBlock.Default(), ...statBlocks[key] };
    return {
      Name: c.Name,
      Id: c.Id,
      Path: c.Path,
      SearchHint: StatBlock.GetKeywords(c),
      Version: c.Version,
      Link: `/my/statblocks/${c.Id}`
    };
  });
}

function getSpellListings(spells: { [key: string]: {} }): ServerListing[] {
  return Object.keys(spells).map(key => {
    const c = { ...Spell.Default(), ...spells[key] };
    return {
      Name: c.Name,
      Id: c.Id,
      Path: c.Path,
      SearchHint: Spell.GetKeywords(c),
      Version: c.Version,
      Link: `/my/spells/${c.Id}`
    };
  });
}

function getEncounterListings(encounters: {
  [key: string]: {};
}): ServerListing[] {
  return Object.keys(encounters).map(key => {
    const c = {
      ...DefaultEncounterState<CombatantState>(),
      ...encounters[key]
    };
    return {
      Name: c.Name,
      Id: c.Id,
      Path: c.Path,
      SearchHint: L.GetEncounterKeywords(c),
      Version: c.Version,
      Link: `/my/encounters/${c.Id}`
    };
  });
}

function getPersistentCharacterListings(persistentCharacters: {
  [key: string]: {};
}): ServerListing[] {
  return Object.keys(persistentCharacters).map(key => {
    const c = { ...DefaultPersistentCharacter(), ...persistentCharacters[key] };
    return {
      Name: c.Name,
      Id: c.Id,
      Path: c.Path,
      SearchHint: StatBlock.GetKeywords(c.StatBlock),
      Version: c.Version,
      Link: `/my/persistentcharacters/${c.Id}`
    };
  });
}

export function setSettings(userId, settings) {
  if (!connectionString) {
    console.error("No connection string found.");
    throw "No connection string found.";
  }

  return client.connect(connectionString).then(async (db: mongo.Db) => {
    const users = db.collection<User>("users");
    const result = await users.updateOne(
      { _id: userId },
      { $set: { settings } }
    );
    db.close();
    return result.modifiedCount;
  });
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
  const db = await client.connect(connectionString);
  const user = await db.collection<User>("users").findOne(
    { _id: userId },
    {
      fields: {
        [`${entityPath}.${entityId}`]: true
      }
    }
  );

  db.close();

  if (!user) {
    throw "User not found";
  }
  const entities = user[entityPath];
  if (entities === undefined) {
    throw `User has no ${entityPath} entities.`;
  }

  return entities[entityId];
}

export function deleteEntity(
  entityPath: EntityPath,
  userId: mongo.ObjectId,
  entityId: string,
  callBack: (result: number) => void
) {
  if (!connectionString) {
    console.error("No connection string found.");
    throw "No connection string found.";
  }

  return client.connect(connectionString).then(async (db: mongo.Db) => {
    const users = db.collection<User>("users");

    const result = await users.updateOne(
      { _id: userId },
      {
        $unset: {
          [`${entityPath}.${entityId}`]: ""
        }
      }
    );

    callBack(result.modifiedCount);
    db.close();
    return;
  });
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

  const db = await client.connect(connectionString);
  const result = await db.collection("users").updateOne(
    { _id: userId },
    {
      $set: {
        [`${entityPath}.${entity.Id}`]: entity
      }
    }
  );

  db.close();

  return result.modifiedCount;
}

export function saveEntitySet<T extends Listable>(
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

  return client.connect(connectionString).then((db: mongo.Db) => {
    const users = db.collection<User>("users");
    return users
      .findOne({ _id: userId })
      .then(u => {
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
      })
      .then(result => {
        db.close();
        callBack(result.modifiedCount);
      });
  });
}
