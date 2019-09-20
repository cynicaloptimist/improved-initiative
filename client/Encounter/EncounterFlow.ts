import * as ko from "knockout";

import { AutoRerollInitiativeOption } from "../../common/Settings";
import { Combatant } from "../Combatant/Combatant";
import { Tag } from "../Combatant/Tag";
import { CurrentSettings } from "../Settings/Settings";
import { CombatTimer } from "../Widgets/CombatTimer";
import { TurnTimer } from "../Widgets/TurnTimer";
import { Encounter } from "./Encounter";

export class EncounterFlow {
  public ActiveCombatant: KnockoutObservable<Combatant> = ko.observable<
    Combatant
  >();
  public TurnTimer = new TurnTimer();
  public CombatTimer = new CombatTimer();
  public State: KnockoutObservable<"active" | "inactive"> = ko.observable<
    "active" | "inactive"
  >("inactive");

  private durationTags: Tag[] = [];

  constructor(private encounter: Encounter) {}

  public StateIcon = ko.pureComputed(() =>
    this.State() === "active" ? "fa-play" : "fa-pause"
  );
  public StateTip = ko.pureComputed(() =>
    this.State() === "active" ? "Encounter Active" : "Encounter Inactive"
  );

  public StartEncounter = () => {
    this.encounter.SortByInitiative();
    if (this.State() == "inactive") {
      this.CombatTimer.SetElapsedRounds(1);
    }
    this.State("active");
    this.ActiveCombatant(this.encounter.Combatants()[0]);
    this.ActiveCombatant().CombatTimer.Start();
    this.ActiveCombatant().CombatTimer.IncrementCombatRounds();
    this.TurnTimer.Start();
    this.CombatTimer.Start();
  };

  public EndEncounter = () => {
    this.State("inactive");

    if (this.ActiveCombatant() != null) {
      this.ActiveCombatant().CombatTimer.Stop();
    }

    this.CombatTimer.Stop();
    this.ActiveCombatant(null);
    this.TurnTimer.Stop();
    this.encounter.TemporaryBackgroundImageUrl(null);
  };

  public NextTurn = (promptRerollInitiative: () => boolean) => {
    const activeCombatant = this.ActiveCombatant();

    this.durationTags
      .filter(
        t =>
          t.HasDuration &&
          t.DurationCombatantId == activeCombatant.Id &&
          t.DurationTiming == "EndOfTurn"
      )
      .forEach(t => t.Decrement());

    let nextIndex = this.encounter.Combatants().indexOf(activeCombatant) + 1;
    if (nextIndex >= this.encounter.Combatants().length) {
      nextIndex = 0;
      const autoRerollOption = CurrentSettings().Rules.AutoRerollInitiative;
      if (autoRerollOption == AutoRerollInitiativeOption.Prompt) {
        promptRerollInitiative();
      }
      if (autoRerollOption == AutoRerollInitiativeOption.Automatic) {
        this.rerollInitiativeWithoutPrompt();
      }
      this.CombatTimer.IncrementCombatRounds();
    }

    const nextCombatant = this.encounter.Combatants()[nextIndex];
    this.ActiveCombatant(nextCombatant);

    activeCombatant.CombatTimer.Stop();
    nextCombatant.CombatTimer.IncrementCombatRounds();
    nextCombatant.CombatTimer.Start();

    this.durationTags
      .filter(
        t =>
          t.HasDuration &&
          t.DurationCombatantId == nextCombatant.Id &&
          t.DurationTiming == "StartOfTurn"
      )
      .forEach(t => t.Decrement());

    this.TurnTimer.Reset();
  };

  public PreviousTurn = () => {
    const activeCombatant = this.ActiveCombatant();

    this.durationTags
      .filter(
        t =>
          t.HasDuration &&
          t.DurationCombatantId == activeCombatant.Id &&
          t.DurationTiming == "StartOfTurn"
      )
      .forEach(t => t.Increment());

    let previousIndex =
      this.encounter.Combatants().indexOf(activeCombatant) - 1;

    if (previousIndex < 0) {
      previousIndex = this.encounter.Combatants().length - 1;
      this.CombatTimer.DecrementCombatRounds();
    }

    const previousCombatant = this.encounter.Combatants()[previousIndex];
    this.ActiveCombatant(previousCombatant);

    activeCombatant.CombatTimer.DecrementCombatRounds();
    activeCombatant.CombatTimer.Stop();
    previousCombatant.CombatTimer.Start();

    this.durationTags
      .filter(
        t =>
          t.HasDuration &&
          t.DurationCombatantId == previousCombatant.Id &&
          t.DurationTiming == "EndOfTurn"
      )
      .forEach(t => t.Increment());

    this.TurnTimer.Reset();
  };

  public CombatStatsString = ko.computed(() => {
    let roundCount = this.CombatTimer.ElapsedRounds();

    let avgTimeString = this.CombatTimer.ReadoutAverageTime();
    let totalTimeString = this.CombatTimer.ReadoutTotalTime();

    return `Combat lasted ${roundCount} rounds, taking ${totalTimeString}, averaging ${avgTimeString} per round.`;
  });

  public AddDurationTag = (tag: Tag) => {
    this.durationTags.push(tag);
  };

  private rerollInitiativeWithoutPrompt = () => {
    const combatants = this.encounter.Combatants();
    combatants.forEach(c => c.Initiative(c.GetInitiativeRoll()));
    this.encounter.SortByInitiative(false);
  };
}
