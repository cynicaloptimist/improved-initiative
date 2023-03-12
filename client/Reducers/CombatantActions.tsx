import { StatBlock } from "../../common/StatBlock";

export type CombatantAction = BaseCombatantAction &
  (SetStatBlock | ApplyDamage);

type BaseCombatantAction = {
  combatantId: string;
};

type SetStatBlock = {
  type: "SetStatBlock";
  newStatBlock: StatBlock;
};

type ApplyDamage = {
  type: "ApplyDamage";
  damageAmount: number;
};
/*
    Todo: 
    
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
