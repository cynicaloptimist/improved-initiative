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
            return users.updateOne(
                {
                    patreonId
                },
                {
                    $set: {
                        patreonId,
                        accessKey,
                        refreshKey,
                        accountStatus
                    }
                },
                {
                    upsert: true
                });
        });
}

export function getSettings(patreonId: string, callBack: (settings: any) => void) {
    if (!connectionString) {
        console.error("No connection string found.");
        //return null;
    }

    return client.connect(connectionString)
        .then((db: mongo.Db) => {
            const users = db.collection("users");
            return users.findOne({ patreonId }).then((user: User) => {
                callBack(user && user.settings || {});
            });
        });
}

export function setSettings(patreonId, settings) {
    if (!connectionString) {
        console.error("No connection string found.");
        //return null;
    }

    return client.connect(connectionString)
        .then((db: mongo.Db) => {
            const users = db.collection("users");
            return users.updateOne(
                { patreonId },
                { $set: { settings } }
            );
        });
}

export function getCreatures(patreonId: string, callBack: (creatures: Listing[]) => void) {
    if (!connectionString) {
        console.error("No connection string found.");
        //return null;
    }

    return client.connect(connectionString)
        .then((db: mongo.Db) => {
            const users = db.collection("users");
            return users
                .findOne({ patreonId })
                .then((user: User) => {
                if (!user.creatures) {
                    return callBack([]);
                } else {
                    const listings = user.creatures.map(c => ({
                        Name: c.Name,
                        Id: c.Id,
                        Keywords: c.Keywords,
                        Link: `/my/creatures/${c.Id}`
                    }));
                    return callBack(listings);
                }
            });
        });
}

export function getCreature(patreonId: string, creatureId: string, callBack: (creature: StatBlock) => void) {
    if (!connectionString) {
        console.error("No connection string found.");
        //return null;
    }

    return client.connect(connectionString)
        .then((db: mongo.Db) => {
            const users = db.collection("users");
            return users.findOne({ patreonId })
                .then((user: User) => {
                    callBack(user.creatures[creatureId])
                });
        });
}

export function saveCreature(patreonId: string, creature: StatBlock, callBack: (creature: StatBlock) => void) {
    if (!connectionString) {
        console.error("No connection string found.");
        //return null;
    }

    if (!creature.Id) {
        throw "No ID on creature";
    }

    return client.connect(connectionString)
        .then((db: mongo.Db) => {
            const users = db.collection("users");
            return users.updateOne({ patreonId },
                {
                    [`creatures.${creature.Id}`]: creature
                }
            )
                .then();
        });
}