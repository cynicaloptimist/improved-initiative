import mongo = require("mongodb");

import { StatBlock } from "../client/StatBlock/StatBlock";

export interface User {
    _id: mongo.ObjectID;
    settings: any;
    statblocks: { [id: string]: StatBlock };
    playercharacters: { [id: string]: StatBlock };
    spells: { [id: string]: any };
    encounters: { [id: string]: any };
}