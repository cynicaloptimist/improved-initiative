import * as React from "react";
import { Checkbox, Form, FormApi, Text, TextArea } from "react-form";
import { NameAndModifier, StatBlock } from "../../common/StatBlock";
import { probablyUniqueString } from "../../common/Toolbox";
import { Button } from "../Components/Button";
import { TextField } from "./components/TextField";

const AbilityNames = ["Str", "Dex", "Con", "Int", "Wis", "Cha"];

interface IdentityFieldsProps { hasFolder: boolean; allowFolder: boolean; allowSaveAs: boolean; }
interface IdentityFieldsState { folderExpanded: boolean; }
class IdentityFields extends React.Component<IdentityFieldsProps, IdentityFieldsState> {
    constructor(props) {
        super(props);
        this.state = {
            folderExpanded: this.props.hasFolder
        };
    }

    private folderElement = () => {
        if (!this.props.allowFolder) {
            return null;
        }
        if (this.state.folderExpanded) {
            return <Text field="Path" />;
        } else {
            return <span className="fa-clickable fa-folder" onClick={() => this.setState({ folderExpanded: true })} />;
        }
    }

    public render() {
        return <React.Fragment>
            <span>
                {this.folderElement()}
                <Text field="Name" />
            </span>
            {this.props.allowSaveAs && <label>Save as a copy <Checkbox field="InitiativeAdvantage" /></label>}
        </React.Fragment>;
    }
}

const valueAndNotesField = (label: string, fieldName: string) =>
    <label className="c-statblock-editor-text">
        <span className="label">{label}</span>
        <div className="inline">
            <Text className="value" type="number" field={`${fieldName}.Value`} />
            <Text className="notes" field={`${fieldName}.Notes`} />
        </div>
    </label>;

const initiativeField = () =>
    <div className="c-statblock-editor-text">
        <label className="label" htmlFor="InitiativeModifier">Initiative Modifier</label>
        <div className="inline">
            <Text className="value" type="number" id="InitiativeModifier" field="InitiativeModifier" />
            <label> Roll with Advantage
                <Checkbox field="InitiativeAdvantage" />
            </label>
        </div>
    </div>;

const abilityScoreField = (abilityName: string) =>
    <div key={abilityName} className="c-statblock-editor-ability">
        <label htmlFor={`ability-${abilityName}`}>{abilityName}</label>
        <Text id={`ability-${abilityName}`} type="number" field={`Abilities.${abilityName}`} />
    </div>;

const nameAndModifierField = (api: FormApi, modifierType: string, index: number) =>
    <div key={index}>
        <Text className="name" field={`${modifierType}[${index}].Name`} />
        <Text className="modifier" type="number" field={`${modifierType}[${index}].Modifier`} />
        <span className="fa-clickable fa-trash"
            onClick={() => api.removeValue(modifierType, index)}
        />
    </div>;

const nameAndModifierFields = (api: FormApi, modifierType: string) => {
    const addButton = <button type="button" className="fa fa-plus c-add-button" onClick={() => api.addValue(modifierType, { Name: "", Modifier: "" })} />;
    if (api.values[modifierType].length == 0) {
        return <div>
            <span className="label">
                {modifierType}
                {addButton}
            </span>
        </div>;
    } else {
        return <div>
            <span className="label">{modifierType}</span>
            <div className="inline-names-and-modifiers">
                {api.values[modifierType].map((v: NameAndModifier, i: number) => nameAndModifierField(api, modifierType, i))}
            </div>
            {addButton}
        </div>;
    }
};

const keywordField = (api: FormApi, modifierType: string, index: number) =>
    <div className="inline" key={index}>
        <Text className="name" field={`${modifierType}[${index}]`} />
        <span className="fa-clickable fa-trash"
            onClick={() => api.removeValue(modifierType, index)}
        />
    </div>;

const keywordFields = (api: FormApi, keywordType: string) => {
    const addButton = <button type="button" className="fa fa-plus c-add-button" onClick={() => api.addValue(keywordType, "")} />;
    if (api.values[keywordType].length == 0) {
        return <div>
            <span className="label">
                {keywordType}
                {addButton}
            </span>
        </div>;
    } else {
        return <div>
            <span className="label">{keywordType}</span>
            {api.values[keywordType].map((v: string, i: number) => keywordField(api, keywordType, i))}
            {addButton}
        </div>;
    }
};

const powerField = (api: FormApi, modifierType: string, index: number) =>
    <div key={index}>
        <div className="inline">
            <Text className="name" placeholder="Name" field={`${modifierType}[${index}].Name`} />
            <span className="fa-clickable fa-trash"
                onClick={() => api.removeValue(modifierType, index)}
            />
        </div>
        <TextArea placeholder="Details" field={`${modifierType}[${index}].Content`} />
    </div>;

const powerFields = (api: FormApi, powerType: string) => {
    const addButton = <button type="button" className="fa fa-plus c-add-button" onClick={() => api.addValue(powerType, "")} />;
    if (api.values[powerType].length == 0) {
        return <div>
            <span className="label">
                {powerType}
                {addButton}
            </span>
        </div>;
    } else {
        return <div>
            <div className="label">{powerType}</div>
            <div className="inline-powers">
                {api.values[powerType].map((v: string, i: number) => powerField(api, powerType, i))}
            </div>
            {addButton}
        </div>;
    }
};

const descriptionField = () =>
    <label className="c-statblock-editor-text">
        <div className="label">Description</div>
        <TextArea field="Description" />
    </label>;

export class StatBlockEditor extends React.Component<StatBlockEditorProps, StatBlockEditorState> {
    private parseIntWhereNeeded = (submittedValues: StatBlock) => {
        AbilityNames.forEach(a => submittedValues.Abilities[a] = parseInt(submittedValues.Abilities[a].toString(), 10));
        submittedValues.HP.Value = parseInt(submittedValues.HP.Value.toString(), 10);
        submittedValues.AC.Value = parseInt(submittedValues.AC.Value.toString(), 10);
        submittedValues.InitiativeModifier = parseInt(submittedValues.InitiativeModifier.toString(), 10);
        submittedValues.Skills.forEach(s => s.Modifier = parseInt(s.Modifier.toString(), 10));
        submittedValues.Saves.forEach(s => s.Modifier = parseInt(s.Modifier.toString(), 10));
    }

    public saveAndClose = (submittedValues) => {
        this.parseIntWhereNeeded(submittedValues);
        const editedStatBlock = {
            ...StatBlock.Default(),
            ...this.props.statBlock,
            ...submittedValues,
        };

        this.props.onSave(editedStatBlock);
        this.props.onClose();
    }

    private close = () => {
        this.props.onClose();
    }

    private delete = () => {
        this.props.onDelete();
        this.props.onClose();
    }

    public saveAs = (submittedValues) => {
        this.parseIntWhereNeeded(submittedValues);
        const editedStatBlock = {
            ...StatBlock.Default(),
            ...this.props.statBlock,
            ...submittedValues,
            Id: probablyUniqueString()
        };

        this.props.onSaveAs(editedStatBlock);
        this.props.onClose();
    }

    public render() {
        const header =
            this.props.editMode == "combatant" ? "Edit Combatant Statblock" :
                this.props.editMode == "library" ? "Edit Library Statblock" :
                    "Edit StatBlock";

        const challengeLabel = this.props.statBlock.Player == "player" ? "Level" : "Challenge";

        return <Form onSubmit={this.saveAndClose}
            defaultValues={this.props.statBlock}
            render={api => (
                <form className="c-statblock-editor"
                    onSubmit={api.submitForm}>
                    <h2>{header}</h2>
                    <div className="scrollframe">
                        <div className="bordered c-statblock-editor-identity">
                            <IdentityFields
                                hasFolder={api.values["Path"] && api.values["Path"].length > 0}
                                allowFolder={this.props.editMode === "library"}
                                allowSaveAs={this.props.onSaveAs !== undefined}
                            />
                        </div>
                        <div className="bordered c-statblock-editor-headers">
                            <TextField label="Portrait URL" fieldName="ImageURL" />
                            <TextField label="Source" fieldName="Source" />
                            <TextField label="Type" fieldName="Type" />
                        </div>
                        <div className="bordered c-statblock-editor-stats">
                            <TextField label={challengeLabel} fieldName="Challenge" />
                            {valueAndNotesField("Hit Points", "HP")}
                            {valueAndNotesField("Armor Class", "AC")}
                            {initiativeField()}
                        </div>
                        <div className="bordered c-statblock-editor-abilityscores">
                            {AbilityNames
                                .map(abilityScoreField)}
                        </div>
                        <div className="bordered c-statblock-editor-saves">
                            {nameAndModifierFields(api, "Saves")}
                        </div>
                        <div className="bordered c-statblock-editor-skills">
                            {nameAndModifierFields(api, "Skills")}
                        </div>
                        {["Speed", "Senses", "DamageVulnerabilities", "DamageResistances", "DamageImmunities", "ConditionImmunities", "Languages"].map(
                            keywordType =>
                                <div key={keywordType} className="bordered c-statblock-editor-keywords">
                                    {keywordFields(api, keywordType)}
                                </div>
                        )}
                        {["Traits", "Actions", "Reactions", "LegendaryActions"].map(
                            powerType =>
                                <div key={powerType} className="bordered c-statblock-editor-powers">
                                    {powerFields(api, powerType)}
                                </div>
                        )}
                        <div className="bordered c-statblock-editor-description">
                            {descriptionField()}
                        </div>
                        {}
                    </div>
                    <div className="c-statblock-editor-buttons">
                        <Button onClick={this.close} faClass="times" />
                        {this.props.onDelete && <Button onClick={this.delete} faClass="trash" />}
                        <button type="submit" className="button fa fa-save" />
                    </div>
                </form>
            )} />;
    }
}

interface StatBlockEditorProps {
    statBlock: StatBlock;
    onSave: (statBlock: StatBlock) => void;
    onDelete?: () => void;
    onSaveAs?: (statBlock: StatBlock) => void;
    onClose: () => void;
    editMode: "library" | "combatant";
}

interface StatBlockEditorState { }