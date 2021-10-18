import * as redis from "redis";
import { PlayerViewState } from "../common/PlayerViewState";
import { InMemoryPlayerViewManager } from "./InMemoryPlayerViewManager";
import { RedisPlayerViewManager } from "./RedisPlayerViewManager";

export interface PlayerViewManager {
  Get(id: string): Promise<PlayerViewState>;

  IdAvailable(id: string): Promise<boolean>;

  UpdateEncounter(id: string, newState: any): void;

  UpdateSettings(id: string, newSettings: any): void;

  InitializeNew(): Promise<string>;

  Destroy(id: string): void;
}

export function GetPlayerViewManager(): PlayerViewManager {
  if (process.env.REDIS_URL) {
    const client = redis.createClient(process.env.REDIS_URL);
    client.on("error", error => {
      console.error("Problem with PlayerViewManager Redis Client: ");
      console.error(error);
    });
    return new RedisPlayerViewManager(client);
  }
  return new InMemoryPlayerViewManager();
}
