import mongo = require("mongodb");
const client = mongo.MongoClient;
const connectionString = process.env.DB_CONNECTION_STRING

import { Listing, StatBlock } from "./library";
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
            const users = db.collection("users");
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
                        options: {},
                    }
                },
                {
                    upsert: true
                });
        });
}

export function getSettings(userId: string, callBack: (settings: any) => void) {
    if (!connectionString) {
        console.error("No connection string found.");
        //return null;
    }

    return client.connect(connectionString)
        .then((db: mongo.Db) => {
            const users = db.collection("users");
            return users.findOne(
                { _id: userId },
                { fields: { settings: true } })
                .then((user: User) => {
                    callBack(user && user.settings || {});
                });
        });
}

export function setSettings(userId, settings) {
    if (!connectionString) {
        console.error("No connection string found.");
        //return null;
    }

    return client.connect(connectionString)
        .then((db: mongo.Db) => {
            const users = db.collection("users");
            return users.updateOne(
                { _id: userId },
                { $set: { settings } }
            );
        });
}

export function getStatBlocks(userId: string, callBack: (statblocks: Listing[]) => void) {
    if (!connectionString) {
        console.error("No connection string found.");
        //return null;
    }

    return client.connect(connectionString)
        .then((db: mongo.Db) => {
            const users = db.collection("users");
            return users
                .findOne({ _id: userId })
                .then((user: User) => {
                    if (!user) {
                        throw "User not found";
                    }
                    if (!user.statblocks) {
                        return callBack([]);
                    } else {
                        const listings = Object.keys(user.statblocks).map(key => {
                            const c = user.statblocks[key];
                            return {
                                Name: c.Name,
                                Id: c.Id,
                                Keywords: c.Type,
                                Version: c.Version,
                                Link: `/my/statblocks/${c.Id}`,
                            }
                        });
                        return callBack(listings);
                    }
                });
        });
}

export function getStatBlock(userId: string, statBlockId: string, callBack: (statBlock: StatBlock) => void) {
    if (!connectionString) {
        console.error("No connection string found.");
        //return null;
    }

    return client.connect(connectionString)
        .then((db: mongo.Db) => {
            const users = db.collection("users");

            return users
                .findOne({ _id: userId },
                {
                    fields: {
                        [`statblocks.${statBlockId}`]: true
                    }
                })
                .then((user: User) => {
                    if (!user) {
                        throw "User not found";
                    }
                    callBack(user.statblocks[statBlockId]);
                });
        });
}

export function saveStatBlock(userId: string, statblock: StatBlock, callBack: (result: number) => void) {
    if (!connectionString) {
        console.error("No connection string found.");
        //return null;
    }

    if (!statblock.Id || !statblock.Version) {
        throw "StatBlock missing Id or Version";
    }

    return client.connect(connectionString)
        .then((db: mongo.Db) => {
            const users = db.collection("users");
            return users.updateOne(
                { _id: userId },
                {
                    $set: {
                        [`statblocks.${statblock.Id}`]: statblock
                    }
                }
            ).then(result => {
                callBack(result.modifiedCount);
            });
        });
}