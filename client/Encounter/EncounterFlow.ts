import * as ko from "knockout";
import * as moment from "moment";

import { AutoRerollInitiativeOption } from "../../common/Settings";
import { Combatant } from "../Combatant/Combatant";
import { Tag } from "../Combatant/Tag";
import { CurrentSettings } from "../Settings/Settings";
import { TurnTimer } from "../Widgets/TurnTimer";
import { Encounter } from "./Encounter";

export class EncounterFlow {
  public ActiveCombatant: KnockoutObservable<Combatant> = ko.observable<
    Combatant
  >();
  public RoundCounter: KnockoutObservable<number> = ko.observable(0);
  public CombatTimeSeconds: KnockoutObservable<number> = ko.observable(0);
  public TurnTimer = new TurnTimer();
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
      this.RoundCounter(1);
    }
    this.State("active");
    this.ActiveCombatant(this.encounter.Combatants()[0]);
    this.TurnTimer.Start();
    this.CombatTimeSeconds(0);
  };

  public EndEncounter = () => {
    this.State("inactive");

    if (this.ActiveCombatant() != null) {
      this.ActiveCombatant().IncrementCombatRounds();
      let elapsedSeconds = this.TurnTimer.ElapsedSeconds();
      this.ActiveCombatant().AddCombatTime(elapsedSeconds);
      this.AddCombatTime(elapsedSeconds);
    }

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
      this.RoundCounter(this.RoundCounter() + 1);
    }

    const nextCombatant = this.encounter.Combatants()[nextIndex];
    this.ActiveCombatant(nextCombatant);
    this.ActiveCombatant().IncrementCombatRounds();

    this.durationTags
      .filter(
        t =>
          t.HasDuration &&
          t.DurationCombatantId == nextCombatant.Id &&
          t.DurationTiming == "StartOfTurn"
      )
      .forEach(t => t.Decrement());

    let elapsedSeconds = this.TurnTimer.ElapsedSeconds();
    activeCombatant.AddCombatTime(elapsedSeconds);
    this.AddCombatTime(elapsedSeconds);
    this.TurnTimer.Reset();
  };

  public PreviousTurn = () => {
    const activeCombatant = this.ActiveCombatant();
    activeCombatant.DecrementCombatRounds();

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
      this.RoundCounter(this.RoundCounter() - 1);
    }

    const previousCombatant = this.encounter.Combatants()[previousIndex];
    this.ActiveCombatant(previousCombatant);

    this.durationTags
      .filter(
        t =>
          t.HasDuration &&
          t.DurationCombatantId == previousCombatant.Id &&
          t.DurationTiming == "EndOfTurn"
      )
      .forEach(t => t.Increment());

    let elapsedSeconds = this.TurnTimer.ElapsedSeconds();
    activeCombatant.AddCombatTime(elapsedSeconds);
    this.AddCombatTime(elapsedSeconds);
    this.TurnTimer.Reset();
  };

  public AddCombatTime(timeSec: number) {
    let currTimeSec = this.CombatTimeSeconds();

    currTimeSec += timeSec;

    this.CombatTimeSeconds(currTimeSec);
  }

  public CombatTimeString = ko.computed(() => {
    const roundCount = this.RoundCounter(),
      elapsedSec = this.CombatTimeSeconds();

    let totalTime = moment.duration({ seconds: elapsedSec });
    let avgTime = moment.duration({ seconds: elapsedSec / roundCount });
    let paddedSeconds = totalTime.seconds().toString();
    let paddedSecondsAvg = avgTime.seconds().toString();
    if (paddedSeconds.length < 2) {
      paddedSeconds = "0" + paddedSeconds;
    }
    if (paddedSecondsAvg.length < 2) {
      paddedSecondsAvg = "0" + paddedSecondsAvg;
    }

    let avgTimeString = avgTime.minutes() + ":" + paddedSecondsAvg;
    let totalTimeString = totalTime.minutes() + ":" + paddedSeconds;

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
