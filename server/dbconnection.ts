import mongo = require("mongodb");
const client = mongo.MongoClient;

import * as _ from "lodash";
import { Listable, ServerListing } from "../common/Listable";
import { DefaultPersistentCharacter, InitializeCharacter } from "../common/PersistentCharacter";
import { DefaultSavedEncounter } from "../common/SavedEncounter";
import { Spell } from "../common/Spell";
import { StatBlock } from "../common/StatBlock";
import * as L from "./library";
import { User } from "./user";

let connectionString;

export const initialize = (initialConnectionString) => {
    if (!initialConnectionString) {
        console.warn("No connection string found.");
        return;
    }

    connectionString = initialConnectionString;

    client.connect(connectionString, function (err, db) {
        if (err) {
            console.log(err);
        }
    });
};

export async function upsertUser(patreonId: string, accessKey: string, refreshKey: string, accountStatus: string) {
    if (!connectionString) {
        console.error("No connection string found.");
        throw "No connection string found.";
    }

    return client.connect(connectionString)
        .then((db: mongo.Db) => {
            const users = db.collection<User>("users");
            return users.findOneAndUpdate(
                {
                    patreonId
                },
                {
                    $set: {
                        patreonId,
                        accessKey,
                        refreshKey,
                        accountStatus,
                    },
                    $setOnInsert: {
                        statblocks: {},
                        playercharacters: {},
                        persistentcharacters: {},
                        spells: {},
                        encounters: {},
                        settings: {},
                    }
                },
                {
                    upsert: true
                })
                .then(res => {
                    return users.findOne({
                        patreonId
                    });
                });
        });
}

export async function getAccount(userId: string) {
    if (!connectionString) {
        console.error("No connection string found.");
        throw "No connection string found.";
    }

    return client.connect(connectionString)
        .then((db: mongo.Db) => {
            const users = db.collection<User>("users");
            return users.findOne({ _id: userId })
                .then((user: User) => {
                    const persistentCharacters = user.persistentcharacters || generatePersistentCharactersAndUpdateUser(user.playercharacters, users, userId);

                    const userWithListings = {
                        settings: user.settings,
                        statblocks: getStatBlockListings(user.statblocks),
                        playercharacters: getPlayerCharacterListings(user.playercharacters),
                        persistentcharacters: getPersistentCharacterListings(persistentCharacters),
                        spells: getSpellListings(user.spells),
                        encounters: getEncounterListings(user.encounters),
                    };

                    return userWithListings;
                });
        });
}

function generatePersistentCharactersAndUpdateUser(playerCharacters: { [key: string]: {} }, users: mongo.Collection<User>, userId: string) {
    const persistentcharacters = _.mapValues(playerCharacters, statBlockUnsafe => {
        const statBlock = { ...StatBlock.Default(), ...statBlockUnsafe };
        return InitializeCharacter(statBlock);
    });

    users.updateOne(
        { _id: userId },
        { $set: { persistentcharacters } }
    );

    return persistentcharacters;
}

function getStatBlockListings(statBlocks: { [key: string]: {} }): ServerListing[] {
    return Object.keys(statBlocks).map(key => {
        const c = { ...StatBlock.Default(), ...statBlocks[key] };
        return {
            Name: c.Name,
            Id: c.Id,
            Path: c.Path,
            SearchHint: StatBlock.GetKeywords(c),
            Version: c.Version,
            Link: `/my/statblocks/${c.Id}`,
        };
    });
}

function getPlayerCharacterListings(playerCharacters: { [key: string]: {} }): ServerListing[] {
    return Object.keys(playerCharacters).map(key => {
        const c = { ...StatBlock.Default(), ...playerCharacters[key] };
        return {
            Name: c.Name,
            Id: c.Id,
            Path: c.Path,
            SearchHint: StatBlock.GetKeywords(c),
            Version: c.Version,
            Link: `/my/playercharacters/${c.Id}`,
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
            Link: `/my/spells/${c.Id}`,
        };
    });
}

function getEncounterListings(encounters: { [key: string]: {} }): ServerListing[] {
    return Object.keys(encounters).map(key => {
        const c = { ...DefaultSavedEncounter(), ...encounters[key] };
        return {
            Name: c.Name,
            Id: c.Id,
            Path: c.Path,
            SearchHint: L.GetEncounterKeywords(c),
            Version: c.Version,
            Link: `/my/encounters/${c.Id}`,
        };
    });
}

function getPersistentCharacterListings(persistentCharacters: { [key: string]: {} }): ServerListing[] {
    return Object.keys(persistentCharacters).map(key => {
        const c = { ...DefaultPersistentCharacter(), ...persistentCharacters[key] };
        return {
            Name: c.Name,
            Id: c.Id,
            Path: c.Path,
            SearchHint: StatBlock.GetKeywords(c.StatBlock),
            Version: c.Version,
            Link: `/my/persistentcharacters/${c.StatBlock.Id}`,
        };
    });
}

export function setSettings(userId, settings) {
    if (!connectionString) {
        console.error("No connection string found.");
        throw "No connection string found.";
    }

    return client.connect(connectionString)
        .then((db: mongo.Db) => {
            const users = db.collection<User>("users");
            return users.updateOne(
                { _id: userId },
                { $set: { settings } }
            );
        });
}

export type EntityPath = "statblocks" | "playercharacters" | "spells" | "encounters" | "persistentcharacters";

export function getEntity(entityPath: EntityPath, userId: string, entityId: string, callBack: (entity: {}) => void) {
    if (!connectionString) {
        console.error("No connection string found.");
        throw "No connection string found.";
    }

    return client.connect(connectionString)
        .then((db: mongo.Db) => {
            const users = db.collection<User>("users");

            return users
                .findOne({ _id: userId },
                    {
                        fields: {
                            [`${entityPath}.${entityId}`]: true
                        }
                    })
                .then((user: User) => {
                    if (!user) {
                        throw "User not found";
                    }
                    const entities = user[entityPath];
                    if (entities === undefined) {
                        throw `User has no ${entityPath} entities.`;
                    } else {
                        callBack(entities[entityId]);
                    }
                });
        });
}

export function deleteEntity(entityPath: EntityPath, userId: string, entityId: string, callBack: (result: number) => void) {
    if (!connectionString) {
        console.error("No connection string found.");
        throw "No connection string found.";
    }

    return client.connect(connectionString)
        .then((db: mongo.Db) => {
            const users = db.collection<User>("users");

            return users.updateOne(
                { _id: userId },
                {
                    $unset: {
                        [`${entityPath}.${entityId}`]: ""
                    }
                }
            ).then(result => {
                callBack(result.modifiedCount);
            });
        });
}

export function saveEntity<T extends Listable>(entityPath: EntityPath, userId: string, entity: T, callBack: (result: number) => void) {
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

    return client.connect(connectionString)
        .then((db: mongo.Db) => {
            const users = db.collection<User>("users");
            return users.updateOne(
                { _id: userId },
                {
                    $set: {
                        [`${entityPath}.${entity.Id}`]: entity
                    }
                }
            ).then(result => {
                callBack(result.modifiedCount);
            });
        });
}

export function saveEntitySet<T extends Listable>(entityPath: EntityPath, userId: string, entities: T[], callBack: (result: number) => void) {
    if (!connectionString) {
        console.error("No connection string found.");
        throw "No connection string found.";
    }

    for (const entity of entities) {
        if (!entity.Id || !entity.Version) {
            throw "Entity missing Id or Version";
        }
    }

    return client.connect(connectionString)
        .then((db: mongo.Db) => {
            const users = db.collection<User>("users");
            return users.findOne({ _id: userId })
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
                        });
                }).then(result => {
                    callBack(result.modifiedCount);
                });
        });
}