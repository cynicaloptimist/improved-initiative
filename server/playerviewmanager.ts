import { PlayerViewState } from "../common/PlayerViewState";

export interface PlayerViewManager {
  Get(id: string): PlayerViewState;

  UpdateEncounter(id: string, newState: any): void;

  UpdateSettings(id: string, newSettings: any): void;

  InitializeNew(): void;

  EnsureInitialized(id: string): void;

  Destroy(id: string): void;
}
