import { Listing } from "../../Library/Listing";
import { Spell } from "../../Spell/Spell";
import { Prompt } from "./Prompt";

const numberSuffixes = ["0th", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"];

export class SpellPrompt implements Prompt {
    public InputSelector = "button";
    public ComponentName = "spellprompt";
    public Spell = ko.observable(Spell.Default());

    public GetType = (spell: Spell) => {
        const ritual = spell.Ritual ? " (ritual)" : "";
        if (spell.Level === 0) {
            return `${spell.School} cantrip${ritual}`;
        }
        const numberSuffix = numberSuffixes[spell.School];
        if (numberSuffix) {
            return `${numberSuffix}-level ${spell.School}${ritual}`;
        }

        return `Level ${spell.Level} ${spell.School}${ritual}`;
    }

    constructor(listing: Listing<Spell>) {
        listing.GetAsyncWithUpdatedId(spell => this.Spell(spell));
    }

    public Resolve = () => { };
}
