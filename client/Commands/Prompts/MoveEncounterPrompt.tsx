import React = require("react");
import { AccountClient } from "../../Account/AccountClient";
import { SavedCombatant, SavedEncounter } from "../../Encounter/SavedEncounter";
import { UpdateLegacySavedEncounter } from "../../Encounter/UpdateLegacySavedEncounter";
import { Prompt } from "./Prompt";

export interface MoveEncounterPromptProps {
    encounterName: string;
}
export interface MoveEncounterPromptState { }

const promptClassName = "p-move-encounter";
const inputClassName = promptClassName + "-input";

export class MoveEncounterPrompt extends React.Component<MoveEncounterPromptProps, MoveEncounterPromptState> {
    private focusInput: HTMLInputElement;
    public componentDidMount() {
        this.focusInput.focus();
    }

    public render() {
        return <span className={promptClassName}>
            Move encounter {this.props.encounterName} to Folder:
            <input ref={i => this.focusInput = i} className={inputClassName} name="folderName" type="text" />
            <button type="submit" className="fa fa-check button"></button>
        </span>;
    }

}

export class MoveEncounterPromptWrapper implements Prompt {
    public InputSelector = "." + inputClassName;
    public ComponentName = "reactprompt";

    private encounterName: string;
    constructor(
        private legacySavedEncounter: { Name?: string },
        private moveEncounter: (savedEncounter: SavedEncounter<SavedCombatant>, oldEncounterId: string) => void,
    ) {
        this.encounterName = legacySavedEncounter.Name || "";
    }

    public Resolve = (form: HTMLFormElement) => {
        const folderName = form.elements["folderName"].value || "";
        const savedEncounter = UpdateLegacySavedEncounter(this.legacySavedEncounter);
        const oldId = savedEncounter.Id;
        savedEncounter.Path = folderName;
        savedEncounter.Id = AccountClient.MakeId(savedEncounter.Name, savedEncounter.Path);
        this.moveEncounter(savedEncounter, oldId);
    }

    private component = <MoveEncounterPrompt encounterName={this.encounterName} />;
}

