import express = require("express");

import KeenTracking = require('keen-tracking');
const keenProjectId = process.env.KEEN_PROJECT_ID || "";
const keenWriteKey = process.env.KEEN_WRITE_KEY || "";

type Req = Express.Request & express.Request;
type Res = Express.Response & express.Response;

export default function (app: express.Application) {
    const keenClient = new KeenTracking({
        projectId: keenProjectId,
        writeKey: keenWriteKey
    });

    app.post("/recordEvent/:eventName", (req: Req, res: Res) => {
        const eventName = req.params.eventName;
        const eventData = req.body || {};
        eventData.sessionId = req.session.id;
        eventData.userId = req.session.userId || null;
        keenClient.recordEvent(eventName, eventData);

        res.sendStatus(201);
    });
}