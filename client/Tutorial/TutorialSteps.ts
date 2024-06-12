import * as _ from "lodash";

interface Position {
  left: number;
  top: number;
}

export interface TutorialStep {
  Message: string;
  RaiseSelector: string;
  AwaitAction?: string;
  CalculatePosition: (elements: NodeListOf<HTMLElement>) => Position;
  HighlightSelector?: string;
}

function getLocation(element: HTMLElement) {
  if (!element) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }

  return element.getBoundingClientRect();
}

export const TutorialSteps: TutorialStep[] = [
  // step 1, add creature
  {
    Message:
      "Let's start by adding a few creatures to the encounter. <strong>Click on any creature</strong> to add one to the encounter pane.",
    RaiseSelector: ".left-column, .prompt, .combatants, .listings, .c-tab:nth-child(1)",
    AwaitAction: "CreatureAdded", 
    CalculatePosition: elements => {
      const location = getLocation(elements.item(0));
      const left = location.left + location.width + 10;
      const top = location.top + 200;
      return { left, top };
    },
    HighlightSelector: ".libraries, .c-tab:nth-child(1)",
  },
  // step 2 - select characters tab
  {
    Message:
      "When you're ready to add some adventurers, select the <strong>Characters</strong> tab at the top of the library.",
    RaiseSelector: ".c-tab:nth-child(2) ",
    AwaitAction: "SelectCharactersTab",
    CalculatePosition: elements => {
      const element = _.last(elements);
      const location = getLocation(element);
      const left = location.left + location.width + 10;
      const top = location.top + 5;
      return { left, top };
    },
    HighlightSelector: ".c-tab:nth-child(2)",
  },
  // step 3 - add sample characters
  {
    Message:
      "It's easy to add your own player characters to Improved Initiative. For now, <strong>add a few sample characters</strong>.",
    RaiseSelector: ".left-column, .combatants",
    AwaitAction: "PlayerCharacterAdded",
    CalculatePosition: elements => {
      const location = getLocation(elements[0]);
      const left = location.left + location.width + 10;
      const top = location.top + 200;
      return { left, top };
    },
    HighlightSelector: ".libraries",
  },
  // step 4 - select encounters tab
  {
    Message:
      "Select the <strong>Encounters</strong> tab at the top of the library.",
    RaiseSelector: ".c-tab:nth-child(3)",
    AwaitAction: "SelectEncountersTab",
    CalculatePosition: elements => {
      const element = _.last(elements);
      const location = getLocation(element);
      const left = location.left + location.width + 10;
      const top = location.top + 5;
      return { left, top };
    },
    HighlightSelector: ".c-tab:nth-child(3)",
  },
  // step 5 - encounter tab explanation
  {
    Message:
      "The Encounters tab is where you can <strong>save and load</strong> encounters.",
    RaiseSelector: ".left-column",
    CalculatePosition: elements => {
      const element = _.last(elements);
      const location = getLocation(element);
      const left = location.left + location.width + 10;
      const top = location.top + 5;
      return { left, top };
    },
    HighlightSelector: ".libraries",
  },
  // step 6 - select spells tab
  {
    Message:
      "Select the <strong>Spells</strong> tab at the top of the library.",
    RaiseSelector: ".c-tab:nth-child(4)",
    AwaitAction: "SelectSpellsTab",
    CalculatePosition: elements => {
      const element = _.last(elements);
      const location = getLocation(element);
      const left = location.left + location.width + 10;
      const top = location.top + 5;
      return { left, top };
    },
    HighlightSelector: ".c-tab:nth-child(4)",
  },
  // step 7 - spell tab explanation
  {
    Message:
      "The Spells tab is where you can <strong>select and view</strong> spell information.",
    RaiseSelector: ".left-column",
    CalculatePosition: elements => {
      const element = _.last(elements);
      const location = getLocation(element);
      const left = location.left + location.width + 10;
      const top = location.top + 5;
      return { left, top };
    },
    HighlightSelector: ".libraries",
  },





  {
    Message:
      "Press 'alt-r' or <strong>click 'Start Encounter'</strong> to roll initiative.",
    RaiseSelector: ".c-button--start-encounter",
    AwaitAction: "ShowInitiativeDialog",
    CalculatePosition: elements => {
      const element = _.last(elements);
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
      let element;
      elements.forEach(e => {
        if (e.classList.contains("combat-footer")) {
          element = e;
        }
      });
      const location = getLocation(element);
      const left = location.left;
      const top =
        location.top -
        (document.getElementsByClassName("tutorial")[0].clientHeight || 0 + 10);
      return { left, top };
    }
  },
  {
    Message:
      "Select a combatant by clicking. You can select multiple combatants by holding the control key.",
    RaiseSelector: ".combatants, .right-column",
    CalculatePosition: elements => {
      const element = elements[0];
      const location = getLocation(element);
      const left = location.left + 5;
      const top = location.top + location.height + 10;
      return { left, top };
    }
  },
  {
    Message:
      "Press 't' or click 'Apply Damage' to apply damage to selected combatants. You can enter a negative number to apply healing.",
    RaiseSelector: ".combatants, .c-button--apply-damage, .prompts, .prompt",
    AwaitAction: "ApplyDamage",
    CalculatePosition: elements => {
      const element = elements[0];
      const location = getLocation(element);
      const left = location.left + location.width + 10;
      const top = location.top + 5;
      return { left, top };
    }
  },
  {
    Message:
      "Click 'Settings' to set keyboard shortcuts and explore advanced features, or choose <strong>End Tutorial</strong>.",
    RaiseSelector: ".c-button--settings",
    AwaitAction: "ShowSettings",
    CalculatePosition: elements => {
      const element = _.last(elements);
      const location = getLocation(element);
      const left = location.left + location.width + 10;
      const top = location.top + 5;
      return { left, top };
    }
  }
];
