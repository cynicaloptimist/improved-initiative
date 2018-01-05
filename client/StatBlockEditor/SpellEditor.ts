import { Spell } from "../Spell/Spell";

export class SpellEditor {
    private saveCallback: (newSpell: Spell) => void;
    private deleteCallback: (id: string) => void;
    private spell: Spell;

    public EditorType = ko.observable<"basic" | "advanced">("basic");
    public JsonSpell = ko.observable<string>();
    public EditableSpell = ko.observable(null);

    public HasSpell = ko.pureComputed(() => this.EditableSpell() !== null);

    public EditSpell = (
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
        let observableSpell = ko["mapping"].fromJS(this.spell);
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

    public SelectInput = () => {
        $(".stats input.name").select();
    }

    public SaveSpell = () => {
        let editedSpell: Spell = Spell.Default();

        if (this.EditorType() === "advanced") {
            try {
                var spellFromJSON = JSON.parse(this.JsonSpell());
            } catch (error) {
                alert(`Couldn't parse JSON from advanced editor.`);
                return;
            }
            $.extend(editedSpell, spellFromJSON)
        }
        if (this.EditorType() === "basic") {
            $.extend(editedSpell, this.unMakeEditable(this.EditableSpell()));
        }

        this.saveCallback(editedSpell);
        this.EditableSpell(null);
    }

    public DeleteSpell = () => {
        if (confirm(`Delete your custom spell ${this.spell.Name}? This cannot be undone.`)) {
            this.deleteCallback(this.spell.Id);
            this.EditableSpell(null);
        }
    }

    public RevertSpell = () => {
        this.EditableSpell(null);
    }
}

ko.components.register("spelleditor", {
    viewModel: params => params.editor,
    template: { name: "spelleditor" }
});
