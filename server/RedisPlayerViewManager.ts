import { Redis } from "ioredis";
import { EncounterState } from "../common/EncounterState";
import { PlayerViewCombatantState } from "../common/PlayerViewCombatantState";
import { PlayerViewState } from "../common/PlayerViewState";
import { getDefaultSettings } from "../common/Settings";
import { probablyUniqueString, ParseJSONOrDefault } from "../common/Toolbox";
import { PlayerViewManager } from "./playerviewmanager";

export class RedisPlayerViewManager implements PlayerViewManager {
  constructor(private redisClient: Redis) {}

  public async Get(id: string): Promise<PlayerViewState> {
    const fields = await this.redisClient.hgetall(`playerviews_${id}`);
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
    const fields = await this.redisClient.hgetall(`playerviews_${id}`);
    return !fields;
  }

  public async UpdateEncounter(id: string, newState: any): Promise<void> {
    this.redisClient.hset(
      `playerviews_${id}`,
      "encounterState",
      JSON.stringify(newState)
    );
  }

  public async UpdateSettings(id: string, newSettings: any): Promise<void> {
    this.redisClient.hset(
      `playerviews_${id}`,
      "settings",
      JSON.stringify(newSettings)
    );
  }

  public async InitializeNew(): Promise<string> {
    const id = probablyUniqueString();

    await this.redisClient.hset(`playerviews_${id}`, {
      encounterState: JSON.stringify(
        EncounterState.Default<PlayerViewCombatantState>()
      ),
      settings: JSON.stringify(getDefaultSettings().PlayerView)
    });
    return id;
  }

  public async Destroy(id: string): Promise<void> {
    this.redisClient.hdel(`playerviews_${id}`, "encounterState", "settings");
  }
}
