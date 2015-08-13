module ImprovedInitiative {
  export class Command {
    Description: string;
    KeyBinding: string;
    ActionBarIcon: string;
    GetActionBinding: () => any;
    ShowOnActionBar: KnockoutObservable<boolean>;
  }
}