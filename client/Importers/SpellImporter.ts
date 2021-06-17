import _ = require("lodash");
import { Spell } from "../../common/Spell";
import { AccountClient } from "../Account/AccountClient";
import { Importer } from "./Importer";

export class SpellImporter extends Importer {
  private static schoolsByInitials = {
    A: "Abjuration",
    C: "Conjuration",
    D: "Divination",
    EN: "Enchantment",
    EV: "Evocation",
    I: "Illusion",
    N: "Necromancy",
    T: "Transmutation"
  };

  public getSource() {
    let source = "";
    const description = this.getDescription();
    const searchString = "Source: ";
    const sourcePos = description.lastIndexOf(searchString);
    if (sourcePos != -1) {
      const sources = description
        .substr(sourcePos + searchString.length)
        .split(/, ?/);
      source = sources[0];
    }
    return source;
  }

  public getDescription() {
    return _.map(
      this.domElement.querySelectorAll("text"),
      e => e.innerHTML
    ).join("\n");
  }

  public GetSpell = () => {
    const spell = Spell.Default();
    spell.Name = this.getString("name");
    spell.Id = AccountClient.MakeId(spell.Name);
    spell.Level = this.getInt("level");
    const initial = this.getString("school");
    spell.School = SpellImporter.schoolsByInitials[initial];
    spell.CastingTime = this.getString("time");
    spell.Range = this.getString("range");
    spell.Components = this.getString("components");
    spell.Duration = this.getString("duration");
    spell.Classes = this.getCommaSeparatedStrings("classes");
    spell.Ritual = this.getString("ritual") === "YES";
    spell.Description = this.getDescription();
    spell.Source = this.getSource();
    return spell;
  };
}
