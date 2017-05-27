import { Prompt } from "./Prompt";
import { Combatant } from "../../Combatant/Combatant";
import { TutorialSpy } from "../../Tutorial/TutorialViewModel";
import { toModifierString } from "../../Utility/Toolbox";
import { registerComponent } from "../../Utility/Components";

export class InitiativePrompt implements Prompt {
    InputSelector = '.response';
    ComponentName = 'initiativeprompt';
    PlayerCharacters = [];
    NonPlayerCharacters = [];
    private dequeue;

    constructor(combatants: Combatant[], startEncounter: () => void) {
        const toPrompt = (combatant: Combatant) => ({
            Id: combatant.Id,
            Prompt: `${combatant.ViewModel.DisplayName()} (${toModifierString(combatant.InitiativeBonus)}): `,
            PreRoll: combatant.GetInitiativeRoll()
        });

        this.PlayerCharacters = combatants.filter(c => c.IsPlayerCharacter).map(toPrompt);
        this.NonPlayerCharacters = combatants.filter(c => !c.IsPlayerCharacter).map(toPrompt);

        this.Resolve = (form: HTMLFormElement) => {
            const inputs = $(form).find(this.InputSelector);
            const responsesById = {};
            inputs.map((_, element) => {
                responsesById[element.id] = $(element).val();
            });
            const applyInitiative = (combatant: Combatant) => {
                const initiativeRoll = parseInt(responsesById[`initiative-${combatant.Id}`]);
                combatant.Initiative(initiativeRoll);
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

registerComponent('initiativeprompt', params => params.prompt);
