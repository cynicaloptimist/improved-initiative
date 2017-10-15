import { StatBlock, Listing } from "./library";
import mongo = require("mongodb");

export interface User {
    _id: mongo.ObjectID;
    settings: any;
    statblocks: { [id: string]: StatBlock };
    playercharacters: { [id: string]: StatBlock };
    spells: { [id: string]: any };
    encounters: { [id: string]: any };
}