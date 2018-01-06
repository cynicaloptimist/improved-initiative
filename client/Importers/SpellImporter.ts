import { Importer } from "./Importer";
import { Spell } from "../Spell/Spell";

export class SpellImporter extends Importer {
    private static schoolsByInitials = {
        "A": "Abjuration",
        "C": "Conjuration",
        "D": "Divination",
        "EN": "Enchantment",
        "EV": "Evocation",
        "I": "Illusion",
        "N": "Necromancy",
        "T": "Transmutation",
    };

    public GetSpell = () => {
        const spell = Spell.Default();
        spell.Name = this.getString("name");
        spell.Level = this.getInt("level");
        const initial = this.getString("school");
        spell.School = SpellImporter.schoolsByInitials[initial];
        spell.CastingTime = this.getString("time");
        spell.Range = this.getString("range");
        spell.Components = this.getString("components");
        spell.Duration = this.getString("duration");
        spell.Classes = this.getCommaSeparatedStrings("classes");
        spell.Ritual = this.getString("ritual") === "YES";

        spell.Description = $(this.domElement).find("text").map((i, e) => e.innerHTML).get().join("\n");

        return spell;
    }
}
