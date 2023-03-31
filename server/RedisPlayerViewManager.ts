import { createClient, RedisClientType } from "redis";
import { EncounterState } from "../common/EncounterState";
import { PlayerViewCombatantState } from "../common/PlayerViewCombatantState";
import { PlayerViewState } from "../common/PlayerViewState";
import { getDefaultSettings } from "../common/Settings";
import { probablyUniqueString, ParseJSONOrDefault } from "../common/Toolbox";
import { PlayerViewManager } from "./playerviewmanager";

async function getClient(url: string) {
  const redisClient = createClient({
    url,
    socket: { tls: true, rejectUnauthorized: false }
  });
  await redisClient.connect();
  return redisClient;
}

export class RedisPlayerViewManager implements PlayerViewManager {
  constructor(private redisUrl: string) {}

  public async Get(id: string): Promise<PlayerViewState> {
    const redisClient = await getClient(this.redisUrl);

    const fields = await redisClient.hGetAll(`playerviews_${id}`);
    const defaultPlayerView = {
      encounterState: EncounterState.Default<PlayerViewCombatantState>(),
      settings: getDefaultSettings().PlayerView
    };

    return {
      encounterState: ParseJSONOrDefault(
        fields.encounterState,
        defaultPlayerView.encounterState
      ),
      settings: ParseJSONOrDefault(fields.settings, defaultPlayerView.settings)
    };
  }

  public async IdAvailable(id: string): Promise<boolean> {
    const redisClient = await getClient(this.redisUrl);
    const fields = await redisClient.hGetAll(`playerviews_${id}`);
    return !fields;
  }

  public async UpdateEncounter(id: string, newState: any): Promise<void> {
    const redisClient = await getClient(this.redisUrl);

    redisClient.hSet(
      `playerviews_${id}`,
      "encounterState",
      JSON.stringify(newState)
    );
  }

  public async UpdateSettings(id: string, newSettings: any): Promise<void> {
    const redisClient = await getClient(this.redisUrl);

    redisClient.hSet(
      `playerviews_${id}`,
      "settings",
      JSON.stringify(newSettings)
    );
  }

  public async InitializeNew(): Promise<string> {
    const id = probablyUniqueString();
    const redisClient = await getClient(this.redisUrl);

    await redisClient.hSet(`playerviews_${id}`, {
      encounterState: JSON.stringify(
        EncounterState.Default<PlayerViewCombatantState>()
      ),
      settings: JSON.stringify(getDefaultSettings().PlayerView)
    });
    return id;
  }

  public async Destroy(id: string): Promise<void> {
    const redisClient = await getClient(this.redisUrl);

    redisClient.hDel(`playerviews_${id}`, ["encounterState", "settings"]);
  }
}
