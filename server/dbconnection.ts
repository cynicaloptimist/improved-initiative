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
                        creatures: {},
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

export function getCreatures(userId: string, callBack: (creatures: Listing[]) => void) {
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
                    if (!user.creatures) {
                        return callBack([]);
                    } else {
                        const listings = Object.keys(user.creatures).map(key => {
                            const c = user.creatures[key];
                            return {
                                Name: c.Name,
                                Id: c.Id,
                                Keywords: c.Type,
                                Version: c.Version,
                                Link: `/my/creatures/${c.Id}`,
                            }
                        });
                        return callBack(listings);
                    }
                });
        });
}

export function getCreature(userId: string, creatureId: string, callBack: (creature: StatBlock) => void) {
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
                        [`creatures.${creatureId}`]: true
                    }
                })
                .then((user: User) => {
                    if (!user) {
                        throw "User not found";
                    }
                    callBack(user.creatures[creatureId]);
                });
        });
}

export function saveCreature(userId: string, creature: StatBlock, callBack: (result: number) => void) {
    if (!connectionString) {
        console.error("No connection string found.");
        //return null;
    }

    if (!creature.Id || !creature.Version) {
        throw "Creature missing Id or Version";
    }

    return client.connect(connectionString)
        .then((db: mongo.Db) => {
            const users = db.collection("users");
            return users.updateOne(
                { _id: userId },
                {
                    $set: {
                        [`creatures.${creature.Id}`]: creature
                    }
                }
            ).then(result => {
                callBack(result.modifiedCount);
            });
        });
}