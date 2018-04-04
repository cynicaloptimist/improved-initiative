import mongo = require("mongodb");

import { StatBlock } from "../client/StatBlock/StatBlock";

export interface User {
    _id: mongo.ObjectID;
    settings: any;
    statblocks: { [id: string]: {} };
    playercharacters: { [id: string]: {} };
    spells: { [id: string]: {} };
    encounters: { [id: string]: {} };
}