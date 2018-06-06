import * as ko from "knockout";
import React = require("react");

import { Listing } from "../../Library/Listing";
import { Spell } from "../../Spell/Spell";
import { StatBlockTextEnricher } from "../../StatBlock/StatBlockTextEnricher";
import { Prompt } from "./Prompt";

const numberSuffixes = ["0th", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"];

interface SpellPromptProps {
    Spell: Spell;
    TextEnricher: StatBlockTextEnricher;
}
 
class SpellPrompt extends React.Component<SpellPromptProps, null> {
    private getSpellType = () => {
        const ritual = this.props.Spell.Ritual ? " (ritual)" : "";
        if (this.props.Spell.Level === 0) {
            return `${this.props.Spell.School} cantrip${ritual}`;
        }
        const numberSuffix = numberSuffixes[this.props.Spell.School];
        if (numberSuffix) {
            return `${numberSuffix}-level ${this.props.Spell.School}${ritual}`;
        }

        return `Level ${this.props.Spell.Level} ${this.props.Spell.School}${ritual}`;
    }
    
    public render() {
        return <React.Fragment>
            <div className="spell">
                <h3>{this.props.Spell.Name}</h3>
                <p className="spell-type">{this.getSpellType()}</p>
                <p><label>Casting Time:</label> {this.props.Spell.CastingTime}</p>
                <p><label>Range:</label> {this.props.Spell.Range}</p>
                <p><label>Components:</label> {this.props.Spell.Components}</p>
                <p><label>Duration:</label> {this.props.Spell.Duration}</p>
                <p><label>Classes:</label> {this.props.Spell.Classes.join(", ")}</p>
                <p>{this.props.TextEnricher.EnrichText(this.props.Spell.Description)}</p>
                <p className="spell-source">Source: {this.props.Spell.Source}</p>
            </div>
            <button type="submit" className="fa fa-check button"></button>
        </React.Fragment>;
    }
}

export class SpellPromptWrapper implements Prompt {
    public InputSelector = "button";
    public ComponentName = "reactprompt";

    protected component = ko.observable();

    constructor(listing: Listing<Spell>, private textEnricher: StatBlockTextEnricher) {
        listing.GetAsyncWithUpdatedId(spell => {
            this.component(<SpellPrompt Spell={spell} TextEnricher={this.textEnricher} />);
        });
    }

    public Resolve = () => { };
}
