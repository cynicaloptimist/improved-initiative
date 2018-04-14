import { Combatant } from "../../Combatant/Combatant";
import { EndOfTurn, StartOfTurn, Tag } from "../../Combatant/Tag";
import { Encounter } from "../../Encounter/Encounter";
import { Conditions } from "../../Rules/Conditions";
import { Metrics } from "../../Utility/Metrics";
import { Prompt } from "./Prompt";

export class TagPrompt implements Prompt {
    public InputSelector = ".response";
    public ComponentName = "tagprompt";

    public Combatants: Combatant[] = [];
    public Conditions = Object.keys(Conditions);
    public DisplayName: string;
    public IsActive: (combatant: Combatant) => boolean;

    public Resolve = form => {
        const inputs = $(form).find(this.InputSelector);
        const responsesById = {};
        inputs.map((_, element) => {
            responsesById[element.id] = $(element).val();
        });
        const text: string = responsesById["tag-text"];
        if (text.length) {
            let tag = new Tag(text, this.targetCombatant);

            if (this.Advanced()) {
                const duration = parseInt(responsesById["tag-duration"]);
                const timing = responsesById["tag-timing"] == "end" ? EndOfTurn : StartOfTurn;
                const timingId = responsesById["tag-timing-id"];

                tag = new Tag(text, this.targetCombatant, duration, timing, timingId);
                this.encounter.AddDurationTag(tag);
            }

            this.targetCombatant.Tags.push(tag);

            this.logEvent(`${this.DisplayName} added tag: "${text}"`);
            Metrics.TrackEvent("TagAdded", { Text: tag.Text, Duration: tag.DurationRemaining() });
            this.targetCombatant.Encounter.QueueEmitEncounter();
        }
    }

    public Advanced = ko.observable(false);
    public ToggleAdvanced = () => this.Advanced(!this.Advanced());

    constructor(private encounter: Encounter,
        private targetCombatant: Combatant,
        private logEvent: (s: string) => void) {
        const activeCombatantId = encounter.ActiveCombatant() ? encounter.ActiveCombatant().Id : "";

        this.Combatants = encounter.Combatants();
        this.DisplayName = targetCombatant.DisplayName();

        this.IsActive = (combatant: Combatant) => {
            return combatant.Id === activeCombatantId;
        };
    }
}
