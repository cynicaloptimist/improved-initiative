export interface EncounterSaveDefaults {
  Name: string;
  Path: string;
}

export interface EncounterState<T> {
  ActiveCombatantId: string | null;
  RoundCounter?: number;
  ElapsedSeconds?: number;
  BackgroundImageUrl?: string;
  SaveEncounterDefaults?: EncounterSaveDefaults | null;
  Combatants: T[];
}

export namespace EncounterState {
  export function Default<T>(): EncounterState<T> {
    return {
      ActiveCombatantId: null,
      RoundCounter: 0,
      ElapsedSeconds: 0,
      SaveEncounterDefaults: null,
      Combatants: []
    };
  }
}
