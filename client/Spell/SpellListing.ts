module ImprovedInitiative {
    export class SpellListing {
        Name: KnockoutObservable<string>;
        
        private spell: KnockoutObservable<Spell>;

        constructor(public Id: string, name: string, public Keywords: string, public Link: string, public Source: string, spell?: Spell) {
            this.Name = ko.observable(name);
            this.spell = ko.observable(spell);
            this.spell.subscribe(newSpell => {
                this.Name(newSpell.Name);
                this.Keywords = Spell.GetKeywords(newSpell);
            });
        }

        GetSpellAsync = (callback: (spell: Spell) => void) => {
            if (this.spell() !== undefined) {
                callback(this.spell());
            }
            else {
                $.getJSON(this.Link, (json) => {
                    const spell = { ...Spell.Default(), ...json };
                    this.spell(spell);
                    callback(spell);
                });
            }
        }
    }
}