import * as redis from "redis";
import { EncounterState } from "../common/EncounterState";
import { PlayerViewCombatantState } from "../common/PlayerViewCombatantState";
import { PlayerViewState } from "../common/PlayerViewState";
import { getDefaultSettings } from "../common/Settings";
import { probablyUniqueString } from "../common/Toolbox";
import { PlayerViewManager } from "./playerviewmanager";

export class RedisPlayerViewManager implements PlayerViewManager {
  private redisClient: redis.RedisClient;
  constructor(redisUrl: string) {
    this.redisClient = redis.createClient(redisUrl);
  }

  public Get = (id: string) =>
    new Promise<PlayerViewState>(done =>
      this.redisClient.hgetall(`playerviews_${id}`, (err, fields) => {
        if (err) {
          done({
            encounterState: EncounterState.Default<PlayerViewCombatantState>(),
            settings: getDefaultSettings().PlayerView
          });
        }
        done({
          encounterState: JSON.parse(fields.encounterState),
          settings: JSON.parse(fields.settings)
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
