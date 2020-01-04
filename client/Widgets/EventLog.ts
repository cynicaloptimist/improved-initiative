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

  public ToggleFullLog = () => {
    if (this.ShowFullLog()) {
      this.ShowFullLog(false);
    } else {
      this.ShowFullLog(true);
      this.scrollToBottomOfLog();
    }
  };

  public ToggleCSS = () =>
    this.ShowFullLog() ? "fa-caret-down" : "fa-caret-up";

  public ShowFullLog = ko.observable<boolean>(false);

  public LogHPChange = (damage: number, combatantNames: string) => {
    if (damage > 0) {
      this.AddEvent(`${damage} damage applied to ${combatantNames}.`);
    }
    if (damage < 0) {
      this.AddEvent(`${-damage} HP restored to ${combatantNames}.`);
    }
  };

  private element = document.getElementsByClassName("event-log")[0];

  private scrollToBottomOfLog = () => {
    const scrollHeight = this.element.scrollHeight;
    this.element.scrollTop = scrollHeight;
  };
}
