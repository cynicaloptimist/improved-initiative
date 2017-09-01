import mongo = require("mongodb");

interface Db extends mongo.Db {
    users: mongo.Collection;
}

export const upsertUser = (patreonId: string, accessKey: string, refreshKey: string, accountStatus: string) => {
    if (!process.env.DB_CONNECTION_STRING) {
        console.warn("No connection string found, returning empty user set.")
        return [];
    }

    const client = mongo.MongoClient;
    client.connect(process.env.DB_CONNECTION_STRING, function (err, db: Db) {
        db.users.updateOne(
            {
                patreonId
            },
            {
                patreonId,
                accessKey,
                refreshKey,
                accountStatus
            },
            {
                upsert: true
            });
    });
}



