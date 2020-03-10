import Awesomplete = require("awesomplete");
import * as React from "react";
import { SavedEncounter } from "../../../common/SavedEncounter";
import { AccountClient } from "../../Account/AccountClient";
import { SubmitButton } from "../../Components/Button";
import { UpdateLegacySavedEncounter } from "../../Encounter/UpdateLegacySavedEncounter";
import { Metrics } from "../../Utility/Metrics";
import { LegacyPrompt } from "./Prompt";

export interface MoveEncounterPromptProps {
  encounterName: string;
  folderNames: string[];
}
export interface MoveEncounterPromptState {}

const promptClassName = "p-move-encounter";
const inputClassName = promptClassName + "-input";

class MoveEncounterPromptComponent extends React.Component<
  MoveEncounterPromptProps,
  MoveEncounterPromptState
> {
  private input: HTMLInputElement;
  public componentDidMount() {
    const awesomplete = new Awesomplete(this.input, {
      list: this.props.folderNames,
      minChars: 0
    });
    awesomplete.evaluate();
    awesomplete.open();
    this.input.focus();
  }

  public render() {
    return (
      <span className={promptClassName}>
        Move encounter {this.props.encounterName} to Folder:
        <input
          ref={i => (this.input = i)}
          className={inputClassName}
          name="folderName"
          type="text"
        />
        <SubmitButton />
      </span>
    );
  }
}

export class MoveEncounterPrompt implements LegacyPrompt {
  public InputSelector = "." + inputClassName;
  public ComponentName = "reactprompt";

  private encounterName: string;

  constructor(
    private legacySavedEncounter: { Name?: string },
    private moveListingFn: (encounter: SavedEncounter, oldId: string) => void,
    folderNames: string[]
  ) {
    this.encounterName = legacySavedEncounter.Name || "";

    this.component = (
      <MoveEncounterPromptComponent
        encounterName={this.encounterName}
        folderNames={folderNames}
      />
    );
  }

  public Resolve = (form: HTMLFormElement) => {
    const folderName = form.elements["folderName"].value || "";
    const savedEncounter = UpdateLegacySavedEncounter(
      this.legacySavedEncounter
    );

    if (savedEncounter.Path == folderName) {
      return;
    }

    const oldId = savedEncounter.Id;
    savedEncounter.Path = folderName;
    savedEncounter.Id = AccountClient.MakeId(
      savedEncounter.Name,
      savedEncounter.Path
    );
    this.moveListingFn(savedEncounter, oldId);
    Metrics.TrackEvent("EncounterMoved", { Path: folderName });
  };

  public component: JSX.Element;
}
