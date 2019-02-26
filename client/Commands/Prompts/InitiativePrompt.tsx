import * as React from "react";
import { toModifierString } from "../../../common/Toolbox";
import { Combatant } from "../../Combatant/Combatant";
import { SubmitButton } from "../../Components/Button";
import { CurrentSettings } from "../../Settings/Settings";
import { TutorialSpy } from "../../Tutorial/TutorialViewModel";
import { Prompt } from "./Prompt";

interface InitiativePromptComponentProps {
  playerCharacters: Combatant[];
  nonPlayerCharacters: Combatant[];
}

class InitiativePromptComponent extends React.Component<
  InitiativePromptComponentProps
> {
  public render() {
    return (
      <div className="roll-initiative" ref={e => (this.element = e)}>
        <div className="roll-initiative__header">
          <h4>Roll Initiative</h4>
          <SubmitButton />
        </div>
        <ul className="playercharacters">
          {this.props.playerCharacters.map(combatantInitiativeField)}
        </ul>
        <ul className="nonplayercharacters">
          {this.props.nonPlayerCharacters.map(combatantInitiativeField)}
        </ul>
      </div>
    );
  }

  public componentDidMount() {
    const firstResponseElement = this.element.getElementsByClassName(
      "response"
    )[0];
    if (firstResponseElement instanceof HTMLInputElement) {
      firstResponseElement.focus();
    }
  }

  private element: HTMLDivElement;
}

const combatantInitiativeField = (combatant: Combatant) => {
  const sideInitiative =
    CurrentSettings().Rules.AutoGroupInitiative == "Side Initiative";
  const initiativeBonus = sideInitiative
    ? 0
    : toModifierString(combatant.InitiativeBonus);

  let advantageIndicator = "";
  if (!sideInitiative) {
    if (
      combatant.StatBlock().InitiativeAdvantage ||
      combatant.StatBlock().InitiativeSpecialRoll == "advantage"
    ) {
      advantageIndicator = "[adv]";
    }
    if (combatant.StatBlock().InitiativeSpecialRoll == "disadvantage") {
      advantageIndicator = "[dadv]";
    }
  }

  const className = combatant.InitiativeGroup() !== null ? "fas fa-link" : "";
  return (
    <li key={combatant.Id}>
      <span
        className={className}
      >{`${combatant.DisplayName()} (${initiativeBonus})${advantageIndicator}: `}</span>
      <input
        className="response"
        type="number"
        id={`initiative-${combatant.Id}`}
        defaultValue={combatant.GetInitiativeRoll().toString()}
      />
    </li>
  );
};

export class InitiativePrompt implements Prompt {
  public InputSelector = ".response";
  public ComponentName = "reactprompt";
  public component: React.ReactElement<InitiativePromptComponent>;

  constructor(
    private combatants: Combatant[],
    private startEncounter: () => void
  ) {
    const groups = [];

    const byGroup = combatants.filter(combatant => {
      const group = combatant.InitiativeGroup();
      if (group) {
        if (groups.indexOf(group) > -1) {
          return false;
        }
        groups.push(group);
      }
      return true;
    });

    const playerCharacters = byGroup.filter(c => c.IsPlayerCharacter);
    const nonPlayerCharacters = byGroup.filter(c => !c.IsPlayerCharacter);

    this.component = (
      <InitiativePromptComponent
        playerCharacters={playerCharacters}
        nonPlayerCharacters={nonPlayerCharacters}
      />
    );
  }

  public Resolve = (form: HTMLFormElement) => {
    const inputs = $(form).find(this.InputSelector);
    const responsesById = {};
    inputs.map((_, element) => {
      responsesById[element.id] = $(element).val();
    });
    const applyInitiative = (combatant: Combatant) => {
      const response = responsesById[`initiative-${combatant.Id}`];
      if (response) {
        combatant.Initiative(parseInt(response));
      }
    };
    this.combatants.forEach(applyInitiative);
    this.startEncounter();
    TutorialSpy("CompleteInitiativeRolls");
  };
}
