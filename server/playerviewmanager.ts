import { RedisClientType, createClient } from "redis";
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

let playerViewManager: PlayerViewManager | null = null;
export async function GetPlayerViewManager(): Promise<PlayerViewManager> {
  if (playerViewManager) {
    return playerViewManager;
  }
  if (process.env.REDIS_URL) {
    playerViewManager = new RedisPlayerViewManager(process.env.REDIS_URL);
  } else {
    playerViewManager = new InMemoryPlayerViewManager();
  }

  return playerViewManager;
}

async function getClient(url: string) {
  const redisClient = createClient({
    url,
    socket: { tls: true, rejectUnauthorized: false }
  });
  redisClient.on("error", error =>
    console.warn("Player View Manager Redis Client:", error)
  );
  await redisClient.connect();
  return redisClient;
}
