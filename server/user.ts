import * as mongo from "mongodb";
import { Listable } from "../common/Listable";

export interface User {
  _id: mongo.ObjectId;
  patreonId: string;
  accountStatus: AccountStatus;
  emailAddress: string;
  googleAnalyticsClientId?: string;
  patreonConversionTracking?: PatreonConversionTracking;
  settings: any;
  statblocks: { [id: string]: any };
  playercharacters?: { [id: string]: any };
  spells: { [id: string]: any };
  encounters: { [id: string]: any };
  persistentcharacters?: { [id: string]: any };
}

export interface PatreonConversionTracking {
  webhookAccountStatus?: AccountStatus;
  pendingConversion?: PendingPatreonConversion;
  lastSentConversionId?: string;
}

export interface PendingPatreonConversion {
  id: string;
  previousAccountStatus: AccountStatus;
  accountStatus: AccountStatus;
  observedAtMs: number;
  webhookEvent: string;
  sendingAtMs?: number;
}

export enum AccountStatus {
  None = "none",
  Pledge = "pledge",
  Epic = "epic",
  Mythic = "mythic"
}
