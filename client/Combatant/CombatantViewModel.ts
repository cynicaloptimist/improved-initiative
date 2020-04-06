import * as ko from "knockout";
import * as _ from "lodash";

import { CombatantCommander } from "../Commands/CombatantCommander";
import { ConcentrationTagText } from "../Prompts/ConcentrationPrompt";
import { CurrentSettings } from "../Settings/Settings";
import { Metrics } from "../Utility/Metrics";
import { Combatant } from "./Combatant";
import { Tag } from "./Tag";
import { TagState } from "../../common/CombatantState";
import { EditInitiativePrompt } from "../Prompts/EditInitiativePrompt";
import { PromptProps } from "../Prompts/PendingPrompts";
import { EditAliasPrompt } from "../Prompts/EditAliasPrompt";

const animatedCombatantIds = ko.observableArray<string>([]);

export class CombatantViewModel {
  public HP: KnockoutComputed<string>;
  public Name: KnockoutComputed<string>;

  constructor(
    public Combatant: Combatant,
    public CombatantCommander: CombatantCommander,
    public EnqueuePrompt: (prompt: PromptProps<any>) => void,
    public LogEvent: (message: string) => void
  ) {
    this.HP = ko.pureComputed(() => {
      if (this.Combatant.TemporaryHP()) {
        return `${this.Combatant.CurrentHP()}+${this.Combatant.TemporaryHP()}/${this.Combatant.MaxHP()}`;
      } else {
        return `${this.Combatant.CurrentHP()}/${this.Combatant.MaxHP()}`;
      }
    });
    this.Name = Combatant.DisplayName;
    setTimeout(() => animatedCombatantIds.push(this.Combatant.Id), 500);
  }

  public ApplyDamage(inputDamage: string) {
    const damage = parseInt(inputDamage),
      healing = -damage,
      shouldAutoCheckConcentration = CurrentSettings().Rules
        .AutoCheckConcentration;

    if (isNaN(damage)) {
      return;
    }

    if (damage > 0) {
      Metrics.TrackEvent("DamageApplied", { Amount: damage.toString() });
      if (
        shouldAutoCheckConcentration &&
        this.Combatant.Tags().some(t => t.Text === ConcentrationTagText)
      ) {
        this.CombatantCommander.CheckConcentration(this.Combatant, damage);
      }
      this.Combatant.ApplyDamage(damage);
    } else {
      this.Combatant.ApplyHealing(healing);
    }
  }

  public ApplyTemporaryHP(newTemporaryHP: number) {
    if (isNaN(newTemporaryHP)) {
      return;
    }

    this.Combatant.ApplyTemporaryHP(newTemporaryHP);
  }

  public ApplyInitiative(initiative: number) {
    this.Combatant.Initiative(initiative);
    this.Combatant.Encounter.SortByInitiative(true);
  }

  public EditInitiative() {
    const prompt = EditInitiativePrompt(this.Combatant, model => {
      if (model.initiativeRoll) {
        if (model.breakLink) {
          this.Combatant.InitiativeGroup(null);
          this.Combatant.Encounter.CleanInitiativeGroups();
        }
        this.ApplyInitiative(model.initiativeRoll);
        this.LogEvent(
          `${this.Name()} initiative set to ${model.initiativeRoll}.`
        );
        Metrics.TrackEvent("InitiativeSet", { Name: this.Name() });
        return true;
      }
      return false;
    });

    this.EnqueuePrompt(prompt);
  }

  public SetAlias() {
    const currentName = this.Combatant.DisplayName();
    const prompt = EditAliasPrompt(this.Combatant, model => {
      this.Combatant.Alias(model.alias);
      if (model.alias) {
        this.LogEvent(`${currentName} alias changed to ${model.alias}.`);
        Metrics.TrackEvent("AliasSet", {
          StatBlockName: this.Combatant.StatBlock().Name,
          Alias: model.alias
        });
      } else {
        this.LogEvent(`${currentName} alias removed.`);
      }
      return true;
    });
    this.EnqueuePrompt(prompt);
  }

  public ToggleHidden() {
    if (this.Combatant.Hidden()) {
      this.Combatant.Hidden(false);
      this.LogEvent(`${this.Name()} revealed in player view.`);
      Metrics.TrackEvent("CombatantRevealed", {
        Name: this.Name()
      });
    } else {
      this.Combatant.Hidden(true);
      this.LogEvent(`${this.Name()} hidden in player view.`);
      Metrics.TrackEvent("CombatantHidden", {
        Name: this.Name()
      });
    }
  }

  public ToggleRevealedAC() {
    if (this.Combatant.RevealedAC()) {
      this.Combatant.RevealedAC(false);
      this.LogEvent(`${this.Name()} AC hidden in player view.`);
      Metrics.TrackEvent("CombatantACHidden", {
        Name: this.Name()
      });
    } else {
      this.Combatant.RevealedAC(true);
      this.LogEvent(`${this.Name()} AC revealed in player view.`);
      Metrics.TrackEvent("CombatantACRevealed", {
        Name: this.Name()
      });
    }
  }

  public RemoveTag = (tag: Tag) => {
    this.Combatant.Tags.splice(this.Combatant.Tags.indexOf(tag), 1);
    this.LogEvent(`${this.Name()} removed tag: "${tag.Text}"`);
  };

  public RemoveTagByState = (tagState: TagState) => {
    const tag = this.Combatant.Tags().find(t =>
      _.isEqual(tagState, t.GetState())
    );
    this.Combatant.Tags.remove(tag);
  };
}
