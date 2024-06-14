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
  // step 8 - start encounter
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
    },
    HighlightSelector: ".c-button--start-encounter",
  },
  // step 9 - initiative dialog
  {
    Message:
      "Enter initiative rolls and <strong>press</strong> the button to continue.",
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
      const left = location.left + location.width + 10;
      const top =
        location.top +
        (document.getElementsByClassName("tutorial")[0].clientHeight || 0 + 10);
      return { left, top };
    },
    HighlightSelector: ".prompt",
  },
  // step 10 - view active combatant
  {
    Message:
      "On the left, you can see the active combatant.",
    RaiseSelector: ".left-column",
    CalculatePosition: elements => {
      const element = elements[0];
      const location = getLocation(element);
      const left = location.left + location.width + 10;
      const top = location.top + 5;
      return { left, top };
    },
    HighlightSelector: ".active-combatant",
  },
  // step 11 - select combatant
  {
    Message:
      "Select a combatant by <strong>clicking</strong> on a combatant. You can select multiple combatants by <strong>holding the control key</strong>.",
    RaiseSelector: ".combatants, .right-column",
    AwaitAction: "combatant-click",
    CalculatePosition: elements => {
      const element = elements[0];
      const location = getLocation(element);
      const left = location.left + 5;
      const top = location.top + location.height + 10;
      return { left, top };
    },
    HighlightSelector: ".selected-combatant, .combatant",
  },
  // step 12 - view combatant action menu
  {
    Message:
      "On the left side of the screen, you can see the <strong>combatant action menu</strong>.",
    RaiseSelector: ".commands-combatant",
    CalculatePosition: elements => {
      const element = elements[0];
      const location = getLocation(element);
      const left = location.left + 5;
      const top = location.top + location.height - 525;
      return { left, top };
    },
    HighlightSelector: ".commands-combatant, .scrollframe",
  },
  // step 13 - apply damage
  {
    Message:
      "let's continue and apply some damage to a selected combatant.<strong>Click 'Apply Damage'</strong> to apply damage to selected combatants. You can enter a <strong>negative number</strong> to apply healing.",
    RaiseSelector: ".c-button--apply-damage, .combatants,  .prompts, .prompt",
    AwaitAction: "ApplyDamage",
    CalculatePosition: elements => {
      const element = elements[0];
      const location = getLocation(element);
      const left = location.left + location.width + 10;
      const top = location.top + 5;
      return { left, top };
    },
    HighlightSelector: ".c-button--apply-damage, .pronmpt",
  },
  // step 14 - view remove from encounter button
  {
    Message:
      "The next button in the combatant action menu is the <strong>Remove from Encounter</strong> button. This button will remove the <strong>selected combatants</strong> from the encounter.",
    RaiseSelector: ".c-button--remove",
    CalculatePosition: elements => {
      const element = elements[0];
      const location = getLocation(element);
      const left = location.left + location.width + 10;
      const top = location.top + 5;
      return { left, top };
    },
    HighlightSelector: ".c-button--remove",
  },
  // step 15 - view rename combatant button
  {
    Message:
      "The next button in the combatant action menu is the <strong>Rename Combatant</strong> button. This button will allow you to rename the <strong>selected combatant</strong>.",
    RaiseSelector: ".c-button--set-alias",
    CalculatePosition: elements => {
      const element = elements[0];
      const location = getLocation(element);
      const left = location.left + location.width + 10;
      const top = location.top + 5;
      return { left, top };
    },
    HighlightSelector: ".c-button--set-alias",
  },
  // step 16 - view quick edit combatant button
  {
    Message:
      "The next button in the combatant action menu is the <strong>Quick Edit Combatant</strong> button. This button will allow you to quickly edit the <strong>selected combatant</strong>.",
    RaiseSelector: ".c-button--quick-edit-statblock",
    CalculatePosition: elements => {
      const element = elements[0];
      const location = getLocation(element);
      const left = location.left + location.width + 10;
      const top = location.top - 50;
      return { left, top };
    },
    HighlightSelector: ".c-button--quick-edit-statblock",
  },
  // step 17 - view move up/down buttons
  {
    Message:
      "The last buttons in the combatant action menu are the <strong>Move Up</strong> and <strong>Move Down</strong> buttons. These buttons will allow you to move the <strong>selected combatant</strong> up or down in the initiative order.",
    RaiseSelector: ".c-button--move-up, .c-button--move-down",
    CalculatePosition: elements => {
      const element = elements[0];
      const location = getLocation(element);
      const left = location.left + location.width + 10;
      const top = location.top - 75;
      return { left, top };
    },
    HighlightSelector: ".c-button--move-up, .c-button--move-down",
  },
  // step 18 - view settings button
  {
    Message:
      "Click <strong>'Settings'</strong> to set keyboard shortcuts and explore advanced features, or choose <strong>End Tutorial</strong>.",
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
