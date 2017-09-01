import mongo = require("mongodb");
const client = mongo.MongoClient;

export const initialize = () => {
    if (!process.env.DB_CONNECTION_STRING) {
        console.error("No connection string found.");
        return;
    }

    client.connect(process.env.DB_CONNECTION_STRING, function (err, db: Db) {
        if (err) {
            return;
        }

        if (!db.users) {
            db.createCollection("users");
        }
    });
};

export const upsertUser = (patreonId: string, accessKey: string, refreshKey: string, accountStatus: string, res) => {
    if (!process.env.DB_CONNECTION_STRING) {
        console.error("No connection string found.");
        return;
    }

    client.connect(process.env.DB_CONNECTION_STRING, function (err, db: mongo.Db) {
        if (err) {
            res.json(err);
            return;
        }

        const users = db.collection("users");
        users.updateOne(
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



