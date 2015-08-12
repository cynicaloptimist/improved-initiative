module ImprovedInitiative {
  export class Command {
    Description: string;
    KeyBinding: string;
    GetActionBinding: () => any;
  }
}