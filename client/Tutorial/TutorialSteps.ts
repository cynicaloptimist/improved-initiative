interface Position {
  left: number;
  top: number;
}

export interface TutorialStep {
  Message: string;
  RaiseSelector: string;
  AwaitAction?: string;
  CalculatePosition: (element: JQuery) => Position;
}

function getLocation(element: JQuery<HTMLElement>) {
  const offset = element.offset() || { left: 0, top: 0 };
  return {
    ...offset,
    width: element.outerWidth() || 0,
    height: element.outerHeight() || 0
  };
}

export const TutorialSteps: TutorialStep[] = [
  {
    Message:
      "Let's start by adding a few creatures to the encounter. <strong>Click on any creature</strong> to add one to the encounter pane.",
    RaiseSelector: ".left-column, .prompt, .combatants",
    CalculatePosition: elements => {
      const location = getLocation(elements);
      const left = location.left + location.width + 10;
      const top = location.top + 200;
      return { left, top };
    }
  },
  {
    Message:
      "When you're ready to add some adventurers, select the <strong>Characters</strong> tab at the top of the library.",
    RaiseSelector: ".libraries .c-tabs .c-tab",
    AwaitAction: "SelectCharactersTab",
    CalculatePosition: elements => {
      const element = elements.last();
      const location = getLocation(element);
      const left = location.left + location.width + 10;
      const top = location.top + 5;
      return { left, top };
    }
  },
  {
    Message:
      "It's easy to add your own player characters to Improved Initiative. For now, <strong>add a few sample characters</strong>.",
    RaiseSelector: ".left-column, .combatants",
    CalculatePosition: elements => {
      const location = getLocation(elements);
      const left = location.left + location.width + 10;
      const top = location.top + 200;
      return { left, top };
    }
  },
  {
    Message:
      "Press 'alt-r' or <strong>click 'Start Encounter'</strong> to roll initiative.",
    RaiseSelector: ".c-button--start-encounter",
    AwaitAction: "ShowInitiativeDialog",
    CalculatePosition: elements => {
      const element = elements.last();
      const location = getLocation(element);
      const left = location.left + location.width + 10;
      const top = location.top + 5;
      return { left, top };
    }
  },
  {
    Message:
      "Enter initiative rolls, or <strong>press enter</strong> to take the pre-rolled results.",
    RaiseSelector: ".prompt",
    AwaitAction: "CompleteInitiativeRolls",
    CalculatePosition: elements => {
      const element = elements.add(".combat-footer").first();
      const location = getLocation(element);
      const left = location.left;
      const top = location.top - ($(".tutorial").outerHeight() || 0 + 10);
      return { left, top };
    }
  },
  {
    Message:
      "Select a combatant by clicking. You can select multiple combatants by holding the control key.",
    RaiseSelector: ".combatants, .right-column",
    CalculatePosition: elements => {
      const element = elements.first();
      const location = getLocation(element);
      const left = location.left + 5;
      const top = location.top + location.height + 10;
      return { left, top };
    }
  },
  {
    Message:
      "Press 't' or click 'Apply Damage' to apply damage to selected combatants. You can enter a negative number to apply healing.",
    RaiseSelector: ".combatants, .c-button--apply-damage, .prompts",
    AwaitAction: "ApplyDamage",
    CalculatePosition: elements => {
      const element = elements.first();
      const location = getLocation(element);
      const left = location.left + location.width + 10;
      const top = location.top + 5;
      return { left, top };
    }
  },
  /*{
        Message: "Press 'n' or click 'Next Turn' to advance the tracker. The active combatant's statblock is displayed for convenience.",
        RaiseSelector: ".c-button--next-turn, .left-column, .combatants",
        CalculatePosition: elements => {
            const element = elements.first();
            const left = location.left + element.outerWidth() + 10;
            const top = location.top + 5;
            return { left, top };
        }
    },*/
  {
    Message:
      "Click 'Settings' to set keyboard shortcuts and explore advanced features, or choose <strong>End Tutorial</strong>.",
    RaiseSelector: ".c-button--settings",
    AwaitAction: "ShowSettings",
    CalculatePosition: elements => {
      const element = elements.last();
      const location = getLocation(element);
      const left = location.left + location.width + 10;
      const top = location.top + 5;
      return { left, top };
    }
  }
];
