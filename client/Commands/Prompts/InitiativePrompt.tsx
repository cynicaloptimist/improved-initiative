import * as React from "react";
import { AutoGroupInitiativeOption } from "../../../common/Settings";
import { toModifierString } from "../../../common/Toolbox";
import { Combatant } from "../../Combatant/Combatant";
import { SubmitButton } from "../../Components/Button";
import { CurrentSettings } from "../../Settings/Settings";
import { TutorialSpy } from "../../Tutorial/TutorialViewModel";
import { LegacyPrompt } from "./Prompt";

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

function combatantInitiativeField(combatant: Combatant) {
  const sideInitiative =
    CurrentSettings().Rules.AutoGroupInitiative ==
    AutoGroupInitiativeOption.SideInitiative;
  const initiativeBonus = sideInitiative
    ? 0
    : toModifierString(combatant.InitiativeBonus());

  let specialRollIndicator = "";
  if (!sideInitiative) {
    if (
      combatant.StatBlock().InitiativeAdvantage ||
      combatant.StatBlock().InitiativeSpecialRoll == "advantage"
    ) {
      specialRollIndicator = " [advantage]";
    }
    if (combatant.StatBlock().InitiativeSpecialRoll == "disadvantage") {
      specialRollIndicator = " [disadvantage]";
    }
    if (combatant.StatBlock().InitiativeSpecialRoll == "take-ten") {
      specialRollIndicator = " [take 10]";
    }
  }

  const className = combatant.InitiativeGroup() !== null ? "fas fa-link" : "";
  return (
    <li key={combatant.Id}>
      <span
        className={className}
      >{`${combatant.DisplayName()} (${initiativeBonus})${specialRollIndicator}: `}</span>
      <input
        className="response"
        type="number"
        id={`initiative-${combatant.Id}`}
        defaultValue={combatant.GetInitiativeRoll().toString()}
      />
    </li>
  );
}

export class InitiativePrompt implements LegacyPrompt {
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

    const playerCharacters = byGroup.filter(c => c.IsPlayerCharacter());
    const nonPlayerCharacters = byGroup.filter(c => !c.IsPlayerCharacter());

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
