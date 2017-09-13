import mongo = require("mongodb");
const client = mongo.MongoClient;

export const initialize = () => {
    if (!process.env.DB_CONNECTION_STRING) {
        console.error("No connection string found.");
        return;
    }

    client.connect(process.env.DB_CONNECTION_STRING, function (err, db) {
        if (err) {
            console.log(err);
        }
    });
};

export function upsertUser(patreonId: string, accessKey: string, refreshKey: string, accountStatus: string, res){
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

export function getSettings(patreonId: string, callBack: (settings: any) => void) {
    if (!process.env.DB_CONNECTION_STRING) {
        console.error("No connection string found.");
        //return null;
    }

    client.connect(process.env.DB_CONNECTION_STRING)
        .then((db: mongo.Db) => {
            const users = db.collection("users");
            users.findOne({ patreonId }).then(user => {
                callBack(user.settings || {});
            });
        });
}

export function setSettings(patreonId, settings) {
    if (!process.env.DB_CONNECTION_STRING) {
        console.error("No connection string found.");
        //return null;
    }

    client.connect(process.env.DB_CONNECTION_STRING)
        .then((db: mongo.Db) => {
            const users = db.collection("users");
            users.updateOne(
                { patreonId },
                { settings }
            );
        });
}


