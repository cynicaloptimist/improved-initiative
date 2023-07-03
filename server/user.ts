import * as mongo from "mongodb";
import { Listable } from "../common/Listable";

export interface User {
  _id: mongo.ObjectId;
  patreonId: string;
  accountStatus: AccountStatus;
  emailAddress: string;
  settings: any;
  statblocks: { [id: string]: any };
  playercharacters?: { [id: string]: any };
  spells: { [id: string]: any };
  encounters: { [id: string]: any };
  persistentcharacters?: { [id: string]: any };
}

export enum AccountStatus {
  None = "none",
  Pledge = "pledge",
  Epic = "epic"
}
