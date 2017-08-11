module ImprovedInitiative {
    export class InitiativePrompt implements Prompt {
        InputSelector = '.response';
        ComponentName = 'initiativeprompt';
        PlayerCharacters = [];
        NonPlayerCharacters = [];
        private dequeue;

        constructor(combatants: Combatant[], startEncounter: () => void) {
            const toPrompt = (combatant: Combatant) => ({
                Id: combatant.Id,
                Prompt: `${combatant.DisplayName()} (${combatant.InitiativeBonus.toModifierString()}): `,
                Css: combatant.InitiativeGroup() !== null ? 'fa fa-link' : '',
                PreRoll: combatant.GetInitiativeRoll()
            });

            const groups = []

            const byGroup = combatants.filter(combatant => {
                const group = combatant.InitiativeGroup();
                if (group) {
                    if (groups.indexOf(group) > -1) {
                        return false;
                    }
                    groups.push(group);
                }
                return true;
            })

            this.PlayerCharacters = byGroup.filter(c => c.IsPlayerCharacter).map(toPrompt);
            this.NonPlayerCharacters = byGroup.filter(c => !c.IsPlayerCharacter).map(toPrompt);

            this.Resolve = (form: HTMLFormElement) => {
                const inputs = $(form).find(this.InputSelector);
                const responsesById = {};
                inputs.map((_, element) => {
                    responsesById[element.id] = $(element).val();
                });
                const applyInitiative = (combatant: Combatant) => {
                    const response = responsesById[`initiative-${combatant.Id}`];
                    if (response) {
                        combatant.Initiative(parseInt(response));
                    }
                };
                combatants.forEach(applyInitiative);
                startEncounter();
                TutorialSpy("CompleteInitiativeRolls");
                this.dequeue();
            }
        }

        Resolve = _ => { };
        SetDequeueCallback = callback => this.dequeue = callback;
    }
}