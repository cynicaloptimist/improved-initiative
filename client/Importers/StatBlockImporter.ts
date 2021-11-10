import * as _ from "lodash";
import { StatBlock } from "../../common/StatBlock";
import { AccountClient } from "../Account/AccountClient";
import { Importer } from "./Importer";

export class StatBlockImporter extends Importer {
  /**
   * Represents the Size, Type, and Alignment of creature.
   * Presented in the form:
   *  <Size> <Type>, <Alignment>
   */
  public getType(): string {
    // Strip any trailing text after the last comma,
    // to remove any source information
    let typeString = this.getString("type");
    const pos = typeString.lastIndexOf(",");
    if (pos != -1) {
      typeString = typeString.substr(0, pos);
    }
    const sizeString = StatBlockImporter.Sizes[this.getString("size")];
    if (sizeString) {
      typeString = sizeString + " " + typeString;
    }
    const alignment = this.getString("alignment");
    if (alignment) {
      typeString = typeString + ", " + alignment;
    }
    return typeString;
  }

  /**
   * Represents the source material this creature originated from.
   */
  public getSource(): string {
    let source = "";
    const description = this.getString("description");
    const searchString = "Source: ";
    const sourcePos = description.lastIndexOf(searchString);
    if (sourcePos != -1) {
      const sources = description
        .substr(sourcePos + searchString.length)
        .split(/, ?/);
      source = sources[0];
    } else {
      const types = this.getCommaSeparatedStrings("type");
      source = _.startCase(types.length > 1 ? types[types.length - 1] : "");
    }
    return source;
  }

  public getAbilities() {
    return {
      Str: this.getInt("str"),
      Dex: this.getInt("dex"),
      Con: this.getInt("con"),
      Int: this.getInt("int"),
      Wis: this.getInt("wis"),
      Cha: this.getInt("cha")
    };
  }

  public GetStatBlock() {
    const statBlock = StatBlock.Default();

    statBlock.Name = this.getString("name");
    statBlock.Id = AccountClient.MakeId(statBlock.Name);
    statBlock.Type = this.getType();
    statBlock.Source = this.getSource();
    statBlock.Abilities = this.getAbilities();

    statBlock.HP = this.getValueAndNotes("hp");
    statBlock.AC = this.getValueAndNotes("ac");
    statBlock.Challenge = this.getString("cr");

    statBlock.Speed = this.getCommaSeparatedStrings("speed");
    statBlock.ConditionImmunities = this.getCommaSeparatedStrings(
      "conditionImmune"
    );
    statBlock.DamageImmunities = this.getCommaSeparatedStrings("immune");
    statBlock.DamageResistances = this.getCommaSeparatedStrings("resist");
    statBlock.DamageVulnerabilities = this.getCommaSeparatedStrings(
      "vulnerable"
    );
    statBlock.Senses = this.getCommaSeparatedStrings("senses");
    statBlock.Languages = this.getCommaSeparatedStrings("languages");

    statBlock.Skills = this.getCommaSeparatedModifiers("skill");
    statBlock.Saves = this.getCommaSeparatedModifiers("save");

    statBlock.Traits = this.getPowers("trait");
    statBlock.Actions = this.getPowers("action");
    statBlock.BonusActions = this.getPowers("bonus");
    statBlock.Reactions = this.getPowers("reaction");
    statBlock.LegendaryActions = this.getPowers("legendary");
    statBlock.MythicActions = this.getPowers("mythic");

    statBlock.Description = this.getString("description");

    return statBlock;
  }

  private static readonly Sizes = {
    T: "Tiny",
    S: "Small",
    M: "Medium",
    L: "Large",
    H: "Huge",
    G: "Gargantuan"
  };
}
