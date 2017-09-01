import mongo = require("mongodb");

interface Db extends mongo.Db {
    users: mongo.Collection;
}

export const upsertUser = (patreonId: string, accessKey: string, refreshKey: string, accountStatus: string, res) => {
    if (!process.env.DB_CONNECTION_STRING) {
        console.error("No connection string found.");
        return;
    }

    const client = mongo.MongoClient;
    client.connect(process.env.DB_CONNECTION_STRING, function (err, db: Db) {
        if (err) {
            res.json(err);
        }
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
            }, (err, result) => {
                if (err) {
                    res.json(err);
                }
                res.json(result);
            });
    });
}



