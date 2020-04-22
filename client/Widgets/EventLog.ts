import * as ko from "knockout";

export class EventLog {
  public Events = ko.observableArray<string>([]);

  public AddEvent = (event: string) => {
    this.Events.unshift(event);
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
