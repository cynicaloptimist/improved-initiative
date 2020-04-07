import * as ko from "knockout";

export class EventLog {
  public Events = ko.observableArray<string>();

  public LatestEvent = ko.pureComputed(
    () =>
      this.Events()[this.Events().length - 1] ||
      "Welcome to Improved Initiative!"
  );
  public EventsTail = ko.pureComputed(() =>
    this.Events().slice(0, this.Events().length - 1)
  );

  public AddEvent = (event: string) => {
    this.Events.push(event);
  };

  public LogHPChange = (damage: number, combatantNames: string) => {
    if (damage > 0) {
      this.AddEvent(`${damage} damage applied to ${combatantNames}.`);
    }
    if (damage < 0) {
      this.AddEvent(`${-damage} HP restored to ${combatantNames}.`);
    }
  };
}
