import { PlayerViewState } from "../common/PlayerViewState";

export interface PlayerViewManager {
  Get(id: string): Promise<PlayerViewState>;

  UpdateEncounter(id: string, newState: any): void;

  UpdateSettings(id: string, newSettings: any): void;

  InitializeNew(): Promise<string>;

  EnsureInitialized(id: string): Promise<void>;

  Destroy(id: string): void;
}
