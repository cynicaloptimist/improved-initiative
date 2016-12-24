module ImprovedInitiative {
    export class PlayerCharacter extends Combatant {
        IsPlayerCharacter = true;

        RollInitiative = (userPollQueue: UserPollQueue) => {
            this.Encounter.RequestInitiative(this, userPollQueue);
            return this.Encounter.Rules.Check(this.InitiativeBonus);
        }
    }
}