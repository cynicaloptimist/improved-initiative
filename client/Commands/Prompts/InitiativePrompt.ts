import { toModifierString } from "../../../common/Toolbox";
import { Combatant } from "../../Combatant/Combatant";
import { CurrentSettings } from "../../Settings/Settings";
import { TutorialSpy } from "../../Tutorial/TutorialViewModel";
import { Prompt } from "./Prompt";

export class InitiativePrompt implements Prompt {
    public InputSelector = ".response";
    public ComponentName = "initiativeprompt";
    public PlayerCharacters = [];
    public NonPlayerCharacters = [];

    constructor(combatants: Combatant[], startEncounter: () => void) {
        const toPrompt = (combatant: Combatant) => {
            const sideInitiative = CurrentSettings().Rules.AutoGroupInitiative == "Side Initiative";
            const initiativeBonus = sideInitiative ? 0 : toModifierString(combatant.InitiativeBonus);
            const advantageIndicator = (!sideInitiative && combatant.StatBlock().InitiativeAdvantage) ? "[adv]" : "";

            return {
                Id: combatant.Id,
                Prompt: `${combatant.DisplayName()} (${initiativeBonus})${advantageIndicator}: `,
                Css: combatant.InitiativeGroup() !== null ? "fa fa-link" : "",
                PreRoll: combatant.GetInitiativeRoll()
            };
        };

        const groups = [];

        const byGroup = combatants.filter(combatant => {
            const group = combatant.InitiativeGroup();
            if (group) {
                if (groups.indexOf(group) > -1) {
                    return false;
                }
                groups.push(group);
            }
            return true;
        });

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
        };
    }

    public Resolve = _ => { };
}
