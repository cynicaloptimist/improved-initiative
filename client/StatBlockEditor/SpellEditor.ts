module ImprovedInitiative {
    export class SpellEditor {
        private saveCallback: (newSpell: Spell) => void;
        private deleteCallback: (id: string) => void;
        private spell: Spell;

        EditorType = ko.observable<'basic' | 'advanced'>('basic');
        JsonSpell = ko.observable<string>();
        EditableSpell = ko.observable(null);

        HasSpell = ko.pureComputed(() => this.EditableSpell() !== null);

        EditSpell = (
            spell: Spell,
            saveCallback: (newSpell: Spell) => void,
            deleteCallback: (id: string) => void
        ) => {
            
            this.spell = { ...Spell.Default(), ...spell }

            this.EditableSpell(this.makeEditable(this.spell));
            this.JsonSpell(JSON.stringify(this.spell, null, 2));
            
            this.saveCallback = saveCallback;
            this.deleteCallback = deleteCallback;
        }

        
        private makeEditable = (spell: Spell) => {
            let observableSpell = ko['mapping'].fromJS(this.spell);
            return observableSpell;
        }

        private unMakeEditable = (editableSpell: any) => {
            let unObservableSpell = ko.toJS(editableSpell);
            delete unObservableSpell.__ko_mapping__;
            const classes = unObservableSpell.Classes;
            if (typeof classes === "string") {
                unObservableSpell.Classes = classes.split(",").map(s => s.trim());
            }
            return unObservableSpell;
        }

        SaveSpell = () => {
            let editedSpell: Spell = Spell.Default();

            if (this.EditorType() === 'advanced') {
                try {
                    var spellFromJSON = JSON.parse(this.JsonSpell());
                } catch (error) {
                    alert(`Couldn't parse JSON from advanced editor.`);
                    return;
                }
                $.extend(editedSpell, spellFromJSON)
            }
            if (this.EditorType() === 'basic') {
                $.extend(editedSpell, this.unMakeEditable(this.EditableSpell()));
            }
            
            this.saveCallback(editedSpell);
            this.EditableSpell(null);
        }

        DeleteSpell = () => {
            if (confirm(`Delete your custom spell ${this.spell.Name}? This cannot be undone.`)) {
                this.deleteCallback(this.spell.Id);
                this.EditableSpell(null);
            }
        }

        RevertSpell = () => {
            this.EditableSpell(null);
        }
    }

    ko.components.register('spelleditor', {
        viewModel: params => params.editor,
        template: { name: 'spelleditor' }
    });
}
