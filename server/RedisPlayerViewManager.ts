import { createClient, RedisClientType } from "redis";
import { EncounterState } from "../common/EncounterState";
import { PlayerViewCombatantState } from "../common/PlayerViewCombatantState";
import { PlayerViewState } from "../common/PlayerViewState";
import { getDefaultSettings } from "../common/Settings";
import { probablyUniqueString, ParseJSONOrDefault } from "../common/Toolbox";
import { PlayerViewManager } from "./playerviewmanager";

export class RedisPlayerViewManager implements PlayerViewManager {
  constructor(private redisUrl: string) {}

  public async Get(id: string): Promise<PlayerViewState> {
    const redisClient = createClient({ url: this.redisUrl });
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
    const redisClient = createClient({ url: this.redisUrl });
    const fields = await redisClient.hGetAll(`playerviews_${id}`);
    return !fields;
  }

  public UpdateEncounter = (id: string, newState: any): void => {
    const redisClient = createClient({ url: this.redisUrl });
    redisClient.hSet(
      `playerviews_${id}`,
      "encounterState",
      JSON.stringify(newState)
    );
  };

  public UpdateSettings = (id: string, newSettings: any): void => {
    const redisClient = createClient({ url: this.redisUrl });

    redisClient.hSet(
      `playerviews_${id}`,
      "settings",
      JSON.stringify(newSettings)
    );
  };

  public InitializeNew = async (): Promise<string> => {
    const id = probablyUniqueString();
    const redisClient = createClient({ url: this.redisUrl });

    await redisClient.hSet(`playerviews_${id}`, {
      encounterState: JSON.stringify(
        EncounterState.Default<PlayerViewCombatantState>()
      ),
      settings: JSON.stringify(getDefaultSettings().PlayerView)
    });
    return id;
  };

  public Destroy = (id: string): void => {
    const redisClient = createClient({ url: this.redisUrl });

    redisClient.hDel(`playerviews_${id}`, ["encounterState", "settings"]);
  };
}
