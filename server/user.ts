import mongo = require("mongodb");

export interface User {
  _id: mongo.ObjectID;
  settings: any;
  statblocks: { [id: string]: {} };
  playercharacters: { [id: string]: {} };
  spells: { [id: string]: {} };
  encounters: { [id: string]: {} };
  persistentcharacters?: { [id: string]: {} };
}
