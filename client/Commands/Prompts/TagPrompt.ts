import { Prompt } from "./Prompt";
import { Combatant } from "../../Combatant/Combatant";
import { Encounter } from "../../Encounter/Encounter";
import { Tag, EndOfTurn, StartOfTurn } from "../../Combatant/Tag";
import { Conditions } from "../../Rules/Conditions";

export class TagPrompt implements Prompt {
    public InputSelector = ".response";
    public ComponentName = "tagprompt";
    private dequeueCallback: () => void;

    public Combatants: Combatant[] = [];
    public Conditions = Object.keys(Conditions);
    public DisplayName: string;
    public IsActive: (combatant: Combatant) => boolean;
    public Resolve = _ => { };
    public SetDequeueCallback = callback => this.dequeueCallback = callback;

    public Advanced = ko.observable(false);
    public ToggleAdvanced = () => this.Advanced(!this.Advanced());

    constructor(encounter: Encounter,
        targetCombatant: Combatant,
        logEvent: (s: string) => void) {
        const activeCombatantId = encounter.ActiveCombatant() ? encounter.ActiveCombatant().Id : "";

        this.Combatants = encounter.Combatants();
        this.DisplayName = targetCombatant.DisplayName();

        this.IsActive = (combatant: Combatant) => {
            return combatant.Id === activeCombatantId;
        };

        this.Resolve = form => {
            const inputs = $(form).find(this.InputSelector);
            const responsesById = {};
            inputs.map((_, element) => {
                responsesById[element.id] = $(element).val();
            });
            const text: string = responsesById["tag-text"];
            if (text.length) {
                let tag = new Tag(text, targetCombatant);

                if (this.Advanced()) {
                    const duration = parseInt(responsesById["tag-duration"]);
                    const timing = responsesById["tag-timing"] == "end" ? EndOfTurn : StartOfTurn;
                    const timingId = responsesById["tag-timing-id"];

                    tag = new Tag(text, targetCombatant, duration, timing, timingId);
                    encounter.AddDurationTag(tag);
                }

                targetCombatant.Tags.push(tag);

                logEvent(`${this.DisplayName} added note: "${text}"`);
                targetCombatant.Encounter.QueueEmitEncounter();
            }
            this.dequeueCallback();
        };
    }
}
