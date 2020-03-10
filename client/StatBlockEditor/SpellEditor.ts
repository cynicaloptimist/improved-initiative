import * as ko from "knockout";
import * as koMapping from "knockout-mapping";

import { Spell } from "../../common/Spell";

export class SpellEditor {
  private saveCallback: (newSpell: Spell) => void;
  private deleteCallback: (id: string) => void;
  private spell: Spell;
  private spellId: string;

  public EditorType = ko.observable<"basic" | "advanced">("basic");
  public JsonSpell = ko.observable<string>();
  public EditableSpell = ko.observable(null);

  public HasSpell = ko.pureComputed(() => this.EditableSpell() !== null);

  public EditSpell = (
    spell: Spell,
    saveCallback: (newSpell: Spell) => void,
    deleteCallback: (id: string) => void
  ) => {
    this.spellId = spell.Id;
    this.spell = { ...Spell.Default(), ...spell };
    delete this.spell.Id;

    this.EditableSpell(this.makeEditable(this.spell));
    this.JsonSpell(JSON.stringify(this.spell, null, 2));

    this.saveCallback = saveCallback;
    this.deleteCallback = deleteCallback;
  };

  private makeEditable = (spell: Spell) => {
    const observableSpell = koMapping.fromJS(this.spell);
    return observableSpell;
  };

  private unMakeEditable = (editableSpell: any) => {
    const unObservableSpell = ko.toJS(editableSpell);
    delete unObservableSpell.__ko_mapping__;
    const classes = unObservableSpell.Classes;
    if (typeof classes === "string") {
      unObservableSpell.Classes = classes.split(",").map(s => s.trim());
    }
    return unObservableSpell;
  };

  public SelectInput = () => {
    $(".stats input.name").select();
  };

  public SaveSpell = () => {
    const editedSpell: Spell = Spell.Default();

    if (this.EditorType() === "advanced") {
      let spellFromJSON = {};
      try {
        spellFromJSON = JSON.parse(this.JsonSpell());
      } catch (error) {
        alert(`Couldn't parse JSON from advanced editor.`);
        return;
      }
      $.extend(editedSpell, spellFromJSON);
    }
    if (this.EditorType() === "basic") {
      $.extend(editedSpell, this.unMakeEditable(this.EditableSpell()));
    }

    editedSpell.Id = this.spellId;

    this.saveCallback(editedSpell);
    this.EditableSpell(null);
  };

  public DeleteSpell = () => {
    if (
      confirm(
        `Delete your custom spell ${this.spell.Name}? This cannot be undone.`
      )
    ) {
      this.deleteCallback(this.spellId);
      this.EditableSpell(null);
    }
  };

  public RevertSpell = () => {
    this.EditableSpell(null);
  };
}
