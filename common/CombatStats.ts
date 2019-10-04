export interface CombatStats {
  elapsedRounds: number;
  elapsedSeconds: number;
  combatants: {
    displayName: string;
    elapsedRounds: number;
    elapsedSeconds: number;
  }[];
}
