module ImprovedInitiative {
	export class PlayerCharacter extends Creature {
		RollInitiative = () => {
			this.Encounter.RequestInitiative(this);
			return this.Encounter.Rules.Check(this.InitiativeModifier);
	  }
	}
}