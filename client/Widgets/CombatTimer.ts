import * as ko from "knockout";

export class CombatTimer {
  private elapsedSeconds = ko.observable(0);
  private elapsedRounds = ko.observable(0);
  private incrementElapsedSeconds = () =>
    this.elapsedSeconds(this.elapsedSeconds() + 1);
  private intervalToken = null;

  public Start = () => {
    if (this.intervalToken) {
      this.Pause();
    }
    this.intervalToken = setInterval(this.incrementElapsedSeconds, 1000);
  };

  public Pause = () => {
    clearInterval(this.intervalToken);
  };

  public Stop = () => {
    clearInterval(this.intervalToken);
    this.elapsedSeconds(0);
    this.elapsedRounds(0);
  };

  public IncrementCombatRounds = () => {
    let currRounds = this.elapsedRounds();

    currRounds += 1;

    this.elapsedRounds(currRounds);
  };

  public DecrementCombatRounds = () => {
    let currRounds = this.elapsedRounds();

    if (currRounds == 0) {
      return;
    }

    currRounds -= 1;

    this.elapsedRounds(currRounds);
  };

  public SetElapsedRounds = (rounds: number) => {
    if (rounds < 0) {
      this.elapsedRounds(0);
    }
    this.elapsedRounds(rounds);
  };

  public SetElapsedSeconds = (seconds: number) => {
    if (seconds < 0) {
      this.elapsedSeconds(0);
    }
    this.elapsedSeconds(seconds);
  };

  public Reset = () => {
    this.Stop();
    this.Start();
  };

  public ElapsedSeconds = ko.pureComputed(() => {
    return this.elapsedSeconds();
  });

  public ElapsedRounds = ko.pureComputed(() => {
    return this.elapsedRounds();
  });
}
