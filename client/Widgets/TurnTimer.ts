import * as ko from "knockout";
import { GetTimerReadout } from "./GetTimerReadout";

export class TurnTimer {
  private elapsedSeconds = ko.observable(0);
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
    this.elapsedSeconds(0);
  };

  public Reset = () => {
    this.Stop();
    this.Start();
  };

  public ElapsedSeconds = ko.pureComputed(() => {
    return this.elapsedSeconds();
  });

  public Readout = ko.pureComputed(() => {
    let elapsedSeconds = this.elapsedSeconds();

    return GetTimerReadout(elapsedSeconds);
  });
}
