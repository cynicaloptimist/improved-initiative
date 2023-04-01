import { PlayerViewState } from "../common/PlayerViewState";
import { InMemoryPlayerViewManager } from "./InMemoryPlayerViewManager";
import { RedisPlayerViewManager } from "./RedisPlayerViewManager";
import Redis from "ioredis";
export interface PlayerViewManager {
  Get(id: string): Promise<PlayerViewState>;

  IdAvailable(id: string): Promise<boolean>;

  UpdateEncounter(id: string, newState: any): void;

  UpdateSettings(id: string, newSettings: any): void;

  InitializeNew(): Promise<string>;

  Destroy(id: string): void;
}

let playerViewManager: PlayerViewManager | null = null;
export async function GetPlayerViewManager(): Promise<PlayerViewManager> {
  if (playerViewManager) {
    return playerViewManager;
  }
  if (process.env.REDIS_URL) {
    const redisClient = new Redis(process.env.REDIS_URL, {
      tls: { rejectUnauthorized: false }
    });
    redisClient.on("error", error =>
      console.warn("Player View Manager Redis Client:", error)
    );
    playerViewManager = new RedisPlayerViewManager(redisClient);
  } else {
    playerViewManager = new InMemoryPlayerViewManager();
  }

  return playerViewManager;
}
