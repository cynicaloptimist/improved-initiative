import { PlayerViewSettings } from "../common/PlayerViewSettings";

export interface PlayerView {
    encounterState: any | null;
    settings: PlayerViewSettings | null;
}