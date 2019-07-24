import { PlayerViewState } from "../common/PlayerViewState";
import { InMemoryPlayerViewManager } from "./InMemoryPlayerViewManager";
import { RedisPlayerViewManager } from "./RedisPlayerViewManager";

export interface PlayerViewManager {
  Get(id: string): Promise<PlayerViewState>;

  UpdateEncounter(id: string, newState: any): void;

  UpdateSettings(id: string, newSettings: any): void;

  InitializeNew(): Promise<string>;

  Destroy(id: string): void;
}

export function GetPlayerViewManager(): PlayerViewManager {
  if (process.env.REDIS_URL) {
    return new RedisPlayerViewManager(process.env.REDIS_URL);
  }
  return new InMemoryPlayerViewManager();
}
