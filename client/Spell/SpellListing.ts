module ImprovedInitiative {
    export class SpellListing {
        Name: KnockoutObservable<string>;
        IsLoaded: boolean;
        Spell: KnockoutObservable<Spell>;
        constructor(public Id: string, name: string, public Keywords: string, public Link: string, public Source: string, spell?: Spell) {
            this.Name = ko.observable(name);
            this.IsLoaded = !!spell;
            this.Spell = ko.observable(spell || { ...Spell.Default(), ...spell });
            this.Spell.subscribe(newSpell => {
                this.Name(newSpell.Name);
                this.Keywords = Spell.GetKeywords(newSpell);
            });
        }

        LoadSpell = (callback: (listing: SpellListing) => void) => {
            if (this.IsLoaded) {
                callback(this);
            }
            else {
                $.getJSON(this.Link, (json) => {
                    this.IsLoaded = true;
                    this.Spell({ ...Spell.Default(), ...json });
                    callback(this);
                });
            }
        }
    }
}