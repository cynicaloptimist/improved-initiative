module ImprovedInitiative {
    export class PlayerCharacter extends Creature {
        IsPlayerCharacter = true;

        RollInitiative = (userPollQueue: UserPollQueue) => {
            this.Encounter.RequestInitiative(this, userPollQueue);
            return this.Encounter.Rules.Check(this.InitiativeModifier);
        }
    }
}