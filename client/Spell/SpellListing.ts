module ImprovedInitiative {
    export class SpellListing {
        Name: KnockoutObservable<string>;
        
        private isLoaded: boolean;
        private spell: KnockoutObservable<Spell>;

        constructor(public Id: string, name: string, public Keywords: string, public Link: string, public Source: string, spell?: Spell) {
            this.Name = ko.observable(name);
            this.isLoaded = !!spell;
            this.spell = ko.observable(spell || Spell.Default());
            this.spell.subscribe(newSpell => {
                this.Name(newSpell.Name);
                this.Keywords = Spell.GetKeywords(newSpell);
            });
        }

        GetSpellAsync = (callback: (spell: Spell) => void) => {
            if (this.isLoaded) {
                callback(this.spell());
            }
            else {
                $.getJSON(this.Link, (json) => {
                    this.isLoaded = true;
                    this.spell({ ...Spell.Default(), ...json });
                    callback(this.spell());
                });
            }
        }
    }
}