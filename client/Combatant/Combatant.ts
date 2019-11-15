import * as ko from "knockout";

import { CombatantState, TagState } from "../../common/CombatantState";
import { InitiativeSpecialRoll, StatBlock } from "../../common/StatBlock";
import { probablyUniqueString } from "../../common/Toolbox";
import { Encounter } from "../Encounter/Encounter";
import { PersistentCharacterUpdater } from "../Library/PersistentCharacterLibrary";
import { CurrentSettings } from "../Settings/Settings";
import { TutorialSpy } from "../Tutorial/TutorialViewModel";
import { Metrics } from "../Utility/Metrics";
import { CombatTimer } from "../Widgets/CombatTimer";
import { Tag } from "./Tag";

export class Combatant {
  constructor(combatantState: CombatantState, public Encounter: Encounter) {
    let statBlock = combatantState.StatBlock;
    this.Id = "" + combatantState.Id; //legacy Id may be a number
    this.PersistentCharacterId = combatantState.PersistentCharacterId || null;

    this.StatBlock(statBlock);

    this.processStatBlock(statBlock);

    this.StatBlock.subscribe(newStatBlock => {
      this.processStatBlock(newStatBlock, statBlock);
      statBlock = newStatBlock;
    });

    this.CurrentHP = ko.observable(combatantState.CurrentHP);
    this.CurrentNotes = ko.observable(combatantState.CurrentNotes || "");

    this.processCombatantState(combatantState);

    this.Initiative.subscribe(newInitiative => {
      const groupId = this.InitiativeGroup();
      if (!this.updatingGroup && groupId) {
        this.updatingGroup = true;
        this.Encounter.Combatants().forEach(combatant => {
          if (combatant.InitiativeGroup() === groupId) {
            combatant.Initiative(newInitiative);
          }
        });
        this.updatingGroup = false;
      }
    });
  }
  public Id = probablyUniqueString();
  public PersistentCharacterId: string | null = null;
  public Alias = ko.observable("");
  public TemporaryHP = ko.observable(0);
  public Tags = ko.observableArray<Tag>();
  public Initiative = ko.observable(0);
  public InitiativeGroup = ko.observable<string>(null);
  public StatBlock = ko.observable<StatBlock>(StatBlock.Default());
  public Hidden = ko.observable(false);
  public RevealedAC = ko.observable(false);

  public CombatTimer = new CombatTimer();

  public IndexLabel: number;
  public CurrentHP: KnockoutObservable<number>;
  public CurrentNotes: KnockoutObservable<string>;
  public PlayerDisplayHP: KnockoutComputed<string>;
  private updatingGroup = false;

  private processStatBlock(newStatBlock: StatBlock, oldStatBlock?: StatBlock) {
    if (oldStatBlock) {
      this.UpdateIndexLabel(oldStatBlock.Name);
    }

    this.setAutoInitiativeGroup();
    if (oldStatBlock) {
      this.Encounter.Combatants.notifySubscribers();
    }
  }

  private processCombatantState(savedCombatant: CombatantState) {
    this.IndexLabel = savedCombatant.IndexLabel || 0;
    this.CurrentHP(savedCombatant.CurrentHP);
    this.CurrentNotes(savedCombatant.CurrentNotes || "");
    this.TemporaryHP(savedCombatant.TemporaryHP);
    this.Initiative(savedCombatant.Initiative);
    this.InitiativeGroup(
      savedCombatant.InitiativeGroup || this.InitiativeGroup()
    );
    this.Alias(savedCombatant.Alias);
    this.Tags(Tag.getLegacyTags(savedCombatant.Tags, this));
    this.Hidden(savedCombatant.Hidden);
    this.RevealedAC(savedCombatant.RevealedAC);
    this.CombatTimer.SetElapsedRounds(savedCombatant.RoundCounter || 0);
    this.CombatTimer.SetElapsedSeconds(savedCombatant.ElapsedSeconds || 0);
  }

  public AttachToPersistentCharacterLibrary(
    library: PersistentCharacterUpdater
  ) {
    const persistentCharacterId = this.PersistentCharacterId;
    if (persistentCharacterId == null) {
      throw "Combatant is not a persistent character";
    }

    this.CurrentHP.subscribe(async c => {
      return await library.UpdatePersistentCharacter(persistentCharacterId, {
        CurrentHP: c
      });
    });

    this.CurrentNotes.subscribe(async n => {
      return await library.UpdatePersistentCharacter(persistentCharacterId, {
        Notes: n
      });
    });
  }

  public UpdateIndexLabel(oldName?: string) {
    const name = this.StatBlock().Name;
    const counts = this.Encounter.CombatantCountsByName();
    if (name == oldName) {
      return;
    }
    if (oldName) {
      if (!counts[oldName]) {
        counts[oldName] = 1;
      }
      counts[oldName] = counts[oldName] - 1;
    }
    if (!counts[name]) {
      counts[name] = 1;
    } else {
      counts[name] = counts[name] + 1;
    }

    const displayNameIsTaken = this.Encounter.Combatants().some(
      c => c.DisplayName() == this.DisplayName() && c != this
    );

    if (
      !this.IndexLabel ||
      this.IndexLabel < counts[name] ||
      displayNameIsTaken
    ) {
      this.IndexLabel = counts[name];
    }

    this.Encounter.CombatantCountsByName(counts);
  }

  public InitiativeBonus = ko.computed(() => {
    const dexterityModifier = this.Encounter.Rules.GetModifierFromScore(
      this.StatBlock().Abilities.Dex
    );
    return dexterityModifier + (this.StatBlock().InitiativeModifier || 0);
  });

  public ConcentrationBonus = ko.computed(() =>
    this.Encounter.Rules.GetModifierFromScore(this.StatBlock().Abilities.Con)
  );

  public IsPlayerCharacter = ko.computed(() =>
    StatBlock.IsPlayerCharacter(this.StatBlock())
  );

  public MaxHP = ko.computed(() => this.StatBlock().HP.Value);

  public GetInitiativeRoll: () => number = () => {
    const sideInitiative =
      CurrentSettings().Rules.AutoGroupInitiative == "Side Initiative";

    let initiativeSpecialRoll: InitiativeSpecialRoll | undefined = undefined;
    if (!sideInitiative) {
      if (this.StatBlock().InitiativeAdvantage) {
        initiativeSpecialRoll = "advantage";
      }

      initiativeSpecialRoll = this.StatBlock().InitiativeSpecialRoll;
    }

    const initiativeBonus = sideInitiative ? 0 : this.InitiativeBonus();
    return this.Encounter.Rules.AbilityCheck(
      initiativeBonus,
      initiativeSpecialRoll
    );
  };

  public GetConcentrationRoll = () =>
    this.Encounter.Rules.AbilityCheck(this.ConcentrationBonus());

  public ApplyDamage(damage: number) {
    let currHP = this.CurrentHP(),
      tempHP = this.TemporaryHP(),
      allowNegativeHP = CurrentSettings().Rules.AllowNegativeHP;

    tempHP -= damage;
    if (tempHP < 0) {
      currHP += tempHP;
      tempHP = 0;
    }

    if (currHP <= 0 && !allowNegativeHP) {
      Metrics.TrackEvent("CombatantDefeated", { Name: this.DisplayName() });
      currHP = 0;
    }

    this.CurrentHP(currHP);
    this.TemporaryHP(tempHP);
    TutorialSpy("ApplyDamage");
  }

  public ApplyHealing(healing: number) {
    let currHP = this.CurrentHP();

    currHP += healing;
    if (currHP > this.StatBlock().HP.Value) {
      currHP = this.StatBlock().HP.Value;
    }

    this.CurrentHP(currHP);
  }

  public ApplyTemporaryHP(tempHP: number) {
    if (tempHP > this.TemporaryHP()) {
      this.TemporaryHP(tempHP);
    }
  }

  public DisplayName = ko.pureComputed(() => {
    const alias = ko.unwrap(this.Alias),
      name = ko.unwrap(this.StatBlock).Name,
      combatantCount = this.Encounter.CombatantCountsByName()[name],
      index = this.IndexLabel;

    if (alias) {
      return alias;
    }
    if (combatantCount > 1) {
      return name + " " + index;
    }

    return name;
  });

  public GetState: () => CombatantState = () => {
    return {
      Id: this.Id,
      PersistentCharacterId: this.PersistentCharacterId || undefined,
      StatBlock: this.StatBlock(),
      CurrentHP: this.CurrentHP(),
      CurrentNotes: this.CurrentNotes(),
      TemporaryHP: this.TemporaryHP(),
      Initiative: this.Initiative(),
      InitiativeGroup: this.InitiativeGroup(),
      Alias: this.Alias(),
      IndexLabel: this.IndexLabel,
      Tags: this.Tags()
        .filter(t => t.NotExpired())
        .map<TagState>(t => ({
          Text: t.Text,
          Hidden: t.HiddenFromPlayerView,
          DurationRemaining: t.DurationRemaining(),
          DurationTiming: t.DurationTiming,
          DurationCombatantId: t.DurationCombatantId
        })),
      Hidden: this.Hidden(),
      RevealedAC: this.RevealedAC(),
      RoundCounter: this.CombatTimer.ElapsedRounds(),
      ElapsedSeconds: this.CombatTimer.ElapsedSeconds(),
      InterfaceVersion: process.env.VERSION || "unknown"
    };
  };

  private setAutoInitiativeGroup = () => {
    const autoInitiativeGroup = CurrentSettings().Rules.AutoGroupInitiative;
    let lowestInitiativeCombatant: Combatant | null = null;
    if (autoInitiativeGroup == "None") {
      return;
    }
    if (autoInitiativeGroup == "By Name") {
      if (this.IsPlayerCharacter()) {
        return;
      }
      lowestInitiativeCombatant = this.findLowestInitiativeGroupByName();
    } else if (autoInitiativeGroup == "Side Initiative") {
      lowestInitiativeCombatant = this.findLowestInitiativeGroupBySide();
    }

    if (lowestInitiativeCombatant) {
      if (!lowestInitiativeCombatant.InitiativeGroup()) {
        const initiativeGroup = probablyUniqueString();
        lowestInitiativeCombatant.InitiativeGroup(initiativeGroup);
      }

      this.Initiative(lowestInitiativeCombatant.Initiative());
      this.InitiativeGroup(lowestInitiativeCombatant.InitiativeGroup());
    }
  };

  private findLowestInitiativeGroupByName(): Combatant {
    const combatants = this.Encounter.Combatants();
    return combatants
      .filter(c => c != this)
      .filter(c => c.StatBlock().Name == this.StatBlock().Name)
      .sort((a, b) => a.Initiative() - b.Initiative())[0];
  }

  private findLowestInitiativeGroupBySide(): Combatant {
    const combatants = this.Encounter.Combatants();
    return combatants
      .filter(c => c != this)
      .filter(c => c.IsPlayerCharacter() === this.IsPlayerCharacter())
      .sort((a, b) => a.Initiative() - b.Initiative())[0];
  }
}
