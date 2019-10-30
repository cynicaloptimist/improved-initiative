import mongo = require("mongodb");

export interface User {
  _id: mongo.ObjectID;
  patreonId: string;
  accountStatus: AccountStatus;
  emailAddress: string;
  settings: any;
  statblocks: { [id: string]: {} };
  playercharacters?: { [id: string]: {} };
  spells: { [id: string]: {} };
  encounters: { [id: string]: {} };
  persistentcharacters?: { [id: string]: {} };
}

export enum AccountStatus {
  None = "none",
  Pledge = "pledge",
  Epic = "epic"
}
