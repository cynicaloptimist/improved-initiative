module ImprovedInitiative {
    const numberSuffixes = ["0th", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"];
        
    export class SpellPrompt implements Prompt {
        private dequeue = () => { };
        InputSelector = "button";
        ComponentName = "spellprompt";
        Spell = ko.observable(Spell.Default());
        SetDequeueCallback = callback => this.dequeue = callback;
        
        GetType = (spell: Spell) => {
            if (spell.Level === 0) {
                return `${spell.School} cantrip`
            }
            const numberSuffix = numberSuffixes[spell.School];
            if (numberSuffix) {
                return `${numberSuffix}-level ${spell.School}`;
            }

            return `Level ${spell.Level} ${spell.School}`;
        }
        
        constructor(listing: SpellListing) {
            listing.LoadSpell(listing => this.Spell(listing.Spell()));
        }

        Resolve = () => this.dequeue();
    }
}