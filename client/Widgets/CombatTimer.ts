import * as ko from "knockout";
import { GetTimerReadout } from "./GetTimerReadout";

export class CombatTimer {
  private elapsedSeconds = ko.observable(0);
  private elapsedRounds = ko.observable(0);
  private incrementElapsedSeconds = () =>
    this.elapsedSeconds(this.elapsedSeconds() + 1);
  private intervalToken = null;

  public Start = () => {
    if (this.intervalToken) {
      this.Stop();
    }
    this.intervalToken = setInterval(this.incrementElapsedSeconds, 1000);
  };

  public Stop = () => {
    clearInterval(this.intervalToken);
  };

  public IncrementCombatRounds() {
    let currRounds = this.elapsedRounds();

    currRounds += 1;

    this.elapsedRounds(currRounds);
  }

  public DecrementCombatRounds() {
    let currRounds = this.elapsedRounds();

    if (currRounds == 0) {
      return;
    }

    currRounds -= 1;

    this.elapsedRounds(currRounds);
  }

  public Reset = () => {
    this.Stop();
    this.elapsedSeconds(0);
    this.elapsedRounds(0);
  };

  public ElapsedSeconds = ko.computed(() => {
    return this.elapsedSeconds();
  });

  public ElapsedRounds = ko.computed(() => {
    return this.elapsedRounds();
  });

  public ReadoutTotalTime = ko.computed(() => {
    let elapsedSeconds = this.ElapsedSeconds();

    return GetTimerReadout(elapsedSeconds);
  });

  public ReadoutAverageTime = ko.computed(() => {
    let elapsedSec = this.elapsedSeconds();
    let elapsedRounds = this.elapsedRounds();

    if (elapsedRounds == 0) {
      return "0:00";
    }

    return GetTimerReadout(elapsedSec / elapsedRounds);
  });
}
