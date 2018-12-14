import { PlayerViewSettings } from "./PlayerViewSettings";

export interface PlayerView {
    encounterState: any | null;
    settings: PlayerViewSettings | null;
}