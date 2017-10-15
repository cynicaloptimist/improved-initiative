import mongo = require("mongodb");
const client = mongo.MongoClient;
const connectionString = process.env.DB_CONNECTION_STRING

import { Listing, StatBlock, LibraryItem } from "./library";
import { User } from "./user";

export const initialize = () => {
    if (!connectionString) {
        console.error("No connection string found.");
        return;
    }

    client.connect(connectionString, function (err, db) {
        if (err) {
            console.log(err);
        }
    });
};

export function upsertUser(patreonId: string, accessKey: string, refreshKey: string, accountStatus: string) {
    if (!connectionString) {
        console.error("No connection string found.");
        return;
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

export function getAccount(userId: string, callBack: (userWithListings: any) => void) {
    if (!connectionString) {
        console.error("No connection string found.");
        //return null;
    }

    return client.connect(connectionString)
        .then((db: mongo.Db) => {
            const users = db.collection<User>("users");
            return users.findOne({ _id: userId })
                .then((user: User) => {
                    const userWithListings = {
                        settings: user.settings,
                        statblocks: getStatBlockListings(user.statblocks),
                        playercharacters: getPlayerCharacterListings(user.playercharacters)
                    }

                    callBack(userWithListings);
                });
        });
}

function getStatBlockListings(statBlocks: { [key: string]: StatBlock }): Listing [] {
    return Object.keys(statBlocks).map(key => {
        const c = statBlocks[key];
        return {
            Name: c.Name,
            Id: c.Id,
            Keywords: c.Type,
            Version: c.Version,
            Link: `/my/statblocks/${c.Id}`,
        }
    });
}

function getPlayerCharacterListings(playerCharacters: { [key: string]: StatBlock }): Listing [] {
    return Object.keys(playerCharacters).map(key => {
        const c = playerCharacters[key];
        return {
            Name: c.Name,
            Id: c.Id,
            Keywords: c.Type,
            Version: c.Version,
            Link: `/my/playercharacters/${c.Id}`,
        }
    });
}

export function setSettings(userId, settings) {
    if (!connectionString) {
        console.error("No connection string found.");
        //return null;
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

type EntityPath = "statblocks" | "playercharacters" | "spells" | "encounters";

export function getEntity<T>(entityPath: EntityPath, userId: string, entityId: string, callBack: (entity: T) => void) {
    if (!connectionString) {
        console.error("No connection string found.");
        //return null;
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
                    callBack(user[entityPath][entityId]);
                });
        });
}

export function saveEntity<T extends LibraryItem>(entityPath: EntityPath, userId: string, entity: T, callBack: (result: number) => void) {
    if (!connectionString) {
        console.error("No connection string found.");
        //return null;
    }

    if (!entity.Id || !entity.Version) {
        throw "Entity missing Id or Version";
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