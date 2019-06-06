export interface EncounterState<T> {
  ActiveCombatantId: string | null;
  RoundCounter?: number;
  BackgroundImageUrl?: string;
  Combatants: T[];
}

export namespace EncounterState {
  export function Default<T>(): EncounterState<T> {
    return {
      ActiveCombatantId: null,
      RoundCounter: 0,
      Combatants: []
    };
  }
}
