import { AccountClient } from "./Account/AccountClient";
import { getDefaultSettings } from "../common/Settings";

export function MockAccountClient(): AccountClient {
  const client = new AccountClient();
  client.GetAccount = callback =>
    callback({
      encounters: [],
      playercharacters: [],
      persistentcharacters: [],
      spells: [],
      statblocks: [],
      settings: getDefaultSettings()
    });

  return client;
}
