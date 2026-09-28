import type { ObjectId } from "mongodb";

import type { ClientEnvironment } from "../common/ClientEnvironment";

declare module "express-session" {
  interface SessionData {
    encounterId?: string;
    postedEncounter?: NonNullable<ClientEnvironment["PostedEncounter"]>;
    isLoggedIn?: boolean;
    hasStorage?: boolean;
    hasEpicInitiative?: boolean;
    hasMythic?: boolean;
    userId?: ObjectId;
  }
}
