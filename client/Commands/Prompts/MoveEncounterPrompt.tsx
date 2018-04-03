import Awesomplete = require("awesomplete");
import _ = require("lodash");
import React = require("react");
import { AccountClient } from "../../Account/AccountClient";
import { SavedCombatant, SavedEncounter } from "../../Encounter/SavedEncounter";
import { UpdateLegacySavedEncounter } from "../../Encounter/UpdateLegacySavedEncounter";
import { EncounterLibrary } from "../../Library/EncounterLibrary";
import { Prompt } from "./Prompt";

export interface MoveEncounterPromptProps {
    encounterName: string;
    folderNames: string[];
}
export interface MoveEncounterPromptState { }

const promptClassName = "p-move-encounter";
const inputClassName = promptClassName + "-input";

export class MoveEncounterPrompt extends React.Component<MoveEncounterPromptProps, MoveEncounterPromptState> {
    private input: HTMLInputElement;
    public componentDidMount() {
        this.input.focus();
        new Awesomplete(this.input, {
            list: this.props.folderNames,
            minChars: 0,
            autoFirst: true
        });
    }

    public render() {
        return <span className={promptClassName}>
            Move encounter {this.props.encounterName} to Folder:
            <input ref={i => this.input = i} className={inputClassName} name="folderName" type="text" />
            <button type="submit" className="fa fa-check button"></button>
        </span>;
    }

}

export class MoveEncounterPromptWrapper implements Prompt {
    public InputSelector = "." + inputClassName;
    public ComponentName = "reactprompt";

    private encounterName: string;
    private folderNames: string[] = [];

    constructor(
        private legacySavedEncounter: { Name?: string },
        private library: EncounterLibrary,
    ) {
        this.encounterName = legacySavedEncounter.Name || "";
        const allFolderNames = this.library.Encounters().map(e => e.Path);
        this.folderNames = _.uniq(allFolderNames);
    }

    public Resolve = (form: HTMLFormElement) => {
        const folderName = form.elements["folderName"].value || "";
        const savedEncounter = UpdateLegacySavedEncounter(this.legacySavedEncounter);
        const oldId = savedEncounter.Id;
        savedEncounter.Path = folderName;
        savedEncounter.Id = AccountClient.MakeId(savedEncounter.Name, savedEncounter.Path);
        this.library.Move(savedEncounter, oldId);
    }

    private component = <MoveEncounterPrompt encounterName={this.encounterName} folderNames={this.folderNames} />;
}

