import * as redis from "redis";
import { EncounterState } from "../common/EncounterState";
import { PlayerViewCombatantState } from "../common/PlayerViewCombatantState";
import { PlayerViewState } from "../common/PlayerViewState";
import { getDefaultSettings } from "../common/Settings";
import { probablyUniqueString, ParseJSONOrDefault } from "../common/Toolbox";
import { PlayerViewManager } from "./playerviewmanager";

export class RedisPlayerViewManager implements PlayerViewManager {
  constructor(private redisClient: redis.RedisClient) {}

  public Get = (id: string) =>
    new Promise<PlayerViewState>(done =>
      this.redisClient.hgetall(`playerviews_${id}`, (err, fields) => {
        const defaultPlayerView = {
          encounterState: EncounterState.Default<PlayerViewCombatantState>(),
          settings: getDefaultSettings().PlayerView
        };
        if (err || !fields) {
          return done(defaultPlayerView);
        }
        return done({
          encounterState: ParseJSONOrDefault(
            fields.encounterState,
            defaultPlayerView.encounterState
          ),
          settings: ParseJSONOrDefault(
            fields.settings,
            defaultPlayerView.settings
          )
        });
      })
    );

  public UpdateEncounter = (id: string, newState: any) =>
    this.redisClient.hset(
      `playerviews_${id}`,
      "encounterState",
      JSON.stringify(newState)
    );

  public UpdateSettings = (id: string, newSettings: any) =>
    this.redisClient.hset(
      `playerviews_${id}`,
      "settings",
      JSON.stringify(newSettings)
    );

  public InitializeNew = async () => {
    const id = probablyUniqueString();
    this.redisClient.hmset(`playerviews_${id}`, {
      encounterState: JSON.stringify(
        EncounterState.Default<PlayerViewCombatantState>()
      ),
      settings: JSON.stringify(getDefaultSettings().PlayerView)
    });
    return id;
  };

  public Destroy = (id: string) =>
    this.redisClient.hdel(`playerviews_${id}`, "encounterState", "settings");
}
