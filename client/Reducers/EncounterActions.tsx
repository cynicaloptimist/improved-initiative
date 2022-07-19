import { CombatantState } from "../../common/CombatantState";
import { StatBlock } from "../../common/StatBlock";

export type Action =
  | AddCombatantFromState
  | AddCombatantFromStatBlock
  | RemoveCombatant
  | StartEncounter
  | EndEncounter;

type AddCombatantFromState = {
  type: "AddCombatantFromState";
  payload: {
    combatantState: CombatantState;
  };
};

type AddCombatantFromStatBlock = {
  type: "AddCombatantFromStatBlock";
  payload: {
    combatantId: string;
    statBlock: StatBlock;
    rolledHP?: number;
  };
};

type RemoveCombatant = {
  type: "RemoveCombatant";
  payload: {
    combatantId: string;
  };
};

type StartEncounter = {
  type: "StartEncounter";
  payload: {
    initiativesByCombatantId: Record<string, number>;
  };
};

type EndEncounter = {
  type: "EndEncounter";
};

/* 
    TODO:
    >EncounterActions
    ClearEncounter
    CleanEncounter
    RestoreAllPlayerCharacterHP
    ApplyInitiativesAndResetRound (for round-to-round encounter reroll)

    >CombatantActions
    SetStatBlock
    ApplyDamage
    ApplyHealing
    ApplyTemporaryHP
    SetInitiative
    LinkInitiative
    AddTag
    RemoveTag
    UpdateNotes
    SetAlias
    ToggleHidden
    ToggleRevealedAC
    MoveDown
    MoveUp
*/
