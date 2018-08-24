import * as Awesomplete from "awesomplete";
import * as _ from "lodash";
import * as React from "react";

import { Combatant } from "../../Combatant/Combatant";
import { EndOfTurn, StartOfTurn, Tag } from "../../Combatant/Tag";
import { Encounter } from "../../Encounter/Encounter";
import { Conditions } from "../../Rules/Conditions";
import { Metrics } from "../../Utility/Metrics";
import { Prompt } from "./Prompt";

interface TagPromptProps {
    targetDisplayNames: string;
    combatants: Combatant[];
    activeCombatantId: string;
}

interface TagPromptState {
    advancedMode: boolean;
}

class TagPrompt extends React.Component<TagPromptProps, TagPromptState> {
    constructor(props) {
        super(props);
        this.state = {
            advancedMode: false
        };
    }
    
    public componentDidMount() {
        this.textInput.focus();

        this.Awesomeplete = new Awesomplete(this.textInput, {
            list: Object.keys(Conditions),
            minChars: 1
        });
    }

    public render() {
        return <div className="add-tag">
            <div>
                Add a tag to {this.props.targetDisplayNames}:
                <input ref={i => this.textInput = i} id="tag-text" className="response" />
                <div className="button fas fa-hourglass" onClick={this.toggleAdvanced} />
                <button type="submit" className="fas fa-check button"></button>
            </div>
            {this.state.advancedMode && this.renderAdvancedFields()}
        </div>;
    }

    private Awesomeplete: Awesomplete;
    private textInput: HTMLInputElement;
    
    private toggleAdvanced = () => this.setState({ advancedMode: !this.state.advancedMode });

    private renderAdvancedFields = () => (
        <div className="tag-advanced">
            ...until
            <select id="tag-timing" className="response">
                <option value="start">start of</option>
                <option value="end">end of</option>
            </select>
            <select id="tag-timing-id" className="response" defaultValue={this.props.activeCombatantId}>
                {this.renderCombatantOptions()}
            </select>'s turn in <input type="number" id="tag-duration" className="response" defaultValue="1" /> round
        </div>
    )

    private renderCombatantOptions = () => this.props.combatants.map(c => (
        <option value={c.Id}>{c.DisplayName()}</option>
    ))
}

export class TagPromptWrapper implements Prompt {
    public InputSelector = ".response";
    public ComponentName = "reactprompt";

    public Resolve = form => {
        const inputs = $(form).find(this.InputSelector);
        const responsesById = {};
        inputs.map((_, element) => {
            responsesById[element.id] = $(element).val();
        });
        const text: string = responsesById["tag-text"];
        if (text.length) {
            if (responsesById["tag-duration"] && responsesById["tag-timing-id"]) {
                const duration = parseInt(responsesById["tag-duration"]);
                const timing = responsesById["tag-timing"] == "end" ? EndOfTurn : StartOfTurn;
                const timingId = responsesById["tag-timing-id"];

                // If tag is set to expire at the end of the current combatant's turn in one round, 
                // we need to add a grace round so it doesn't end immediately at the end of this turn.
                const timingKeyedCombatant = _.find(this.component.props.combatants, c => timingId == c.Id);
                const timingKeyedCombatantIsActive = timingKeyedCombatant.Id == this.component.props.activeCombatantId;
                const durationGraceRound = (timingKeyedCombatantIsActive && timing == EndOfTurn) ? 1 : 0;

                for (const combatant of this.targetCombatants) {
                    const tag = new Tag(text, combatant, duration + durationGraceRound, timing, timingId);
                    this.encounter.AddDurationTag(tag);
                    combatant.Tags.push(tag);
                    Metrics.TrackEvent("TagAdded", { Text: tag.Text, Duration: tag.DurationRemaining() });
                }
            } else {
                for (const combatant of this.targetCombatants) {
                    const tag = new Tag(text, combatant);
                    combatant.Tags.push(tag);
                    Metrics.TrackEvent("TagAdded", { Text: tag.Text });
                }
            }

            this.logEvent(`Added "${text}" tag to ${this.component.props.targetDisplayName}`);
            this.encounter.QueueEmitEncounter();
        }
    }

    constructor(private encounter: Encounter,
        private targetCombatants: Combatant [],
        private logEvent: (s: string) => void) {
        
        this.component = <TagPrompt
            activeCombatantId={encounter.ActiveCombatant() ? encounter.ActiveCombatant().Id : ""}
            combatants={encounter.Combatants()}
            targetDisplayNames={targetCombatants.map(t => t.DisplayName()).join(", ")}
        />;
    }

    public component: JSX.Element;
}
