import * as React from "react";
import { Checkbox, Form, FormApi, Text, TextArea, } from "react-form";
import { NameAndModifier, StatBlock } from "../../common/StatBlock";
import { Button } from "../Components/Button";
import { TextField } from "./components/TextField";

const AbilityNames = ["Str", "Dex", "Con", "Int", "Wis", "Cha"];

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
        };

        this.props.onSaveAs(editedStatBlock);
        this.props.onClose();
    }

    private valueAndNotesField = (label: string, fieldName: string) =>
        <label className="c-statblock-editor-text">
            <span className="label">{label}</span>
            <div className="inline">
                <Text className="value" type="number" field={`${fieldName}.Value`} />
                <Text className="notes" field={`${fieldName}.Notes`} />
            </div>
        </label>

    private initiativeField = () =>
        <div className="c-statblock-editor-text">
            <label className="label" htmlFor="InitiativeModifier">Initiative Modifier</label>
            <div className="inline">
                <Text className="value" id="InitiativeModifier" field="InitiativeModifier" />
                <label> Roll with Advantage
                <Checkbox field="InitiativeAdvantage" />
                </label>
            </div>
        </div>

    private abilityScoreField = (abilityName: string) =>
        <div key={abilityName} className="c-statblock-editor-ability">
            <label htmlFor={`ability-${abilityName}`}>{abilityName}</label>
            <Text id={`ability-${abilityName}`} type="number" field={`Abilities.${abilityName}`} />
        </div>

    private nameAndModifierField = (api: FormApi, modifierType: string, index: number) =>
        <div key={index}>
            <Text className="name" field={`${modifierType}[${index}].Name`} />
            <Text className="modifier" type="number" field={`${modifierType}[${index}].Modifier`} />
            <span className="fa-clickable fa-trash"
                onClick={() => api.removeValue(modifierType, index)}
            />
        </div>

    private nameAndModifierFields = (api: FormApi, modifierType: string) => {
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
                    {api.values[modifierType].map((v: NameAndModifier, i: number) => this.nameAndModifierField(api, modifierType, i))}
                </div>
                {addButton}
            </div>;
        }
    }

    private keywordField = (api: FormApi, modifierType: string, index: number) =>
        <div className="inline" key={index}>
            <Text className="name" field={`${modifierType}[${index}]`} />
            <span className="fa-clickable fa-trash"
                onClick={() => api.removeValue(modifierType, index)}
            />
        </div>

    private keywordFields = (api: FormApi, keywordType: string) => {
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
                {api.values[keywordType].map((v: string, i: number) => this.keywordField(api, keywordType, i))}
                {addButton}
            </div>;
        }
    }

    private powerField = (api: FormApi, modifierType: string, index: number) =>
        <div key={index}>
            <div className="inline">
                <Text className="name" placeholder="Name" field={`${modifierType}[${index}].Name`} />
                <span className="fa-clickable fa-trash"
                    onClick={() => api.removeValue(modifierType, index)}
                />
            </div>
            <TextArea placeholder="Details" field={`${modifierType}[${index}].Content`} />
        </div>

    private powerFields = (api: FormApi, powerType: string) => {
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
                    {api.values[powerType].map((v: string, i: number) => this.powerField(api, powerType, i))}
                </div>
                {addButton}
            </div>;
        }
    }

    private descriptionField = () =>
        <label className="c-statblock-editor-text">
            <div className="label">Description</div>
            <TextArea field="Description" />
        </label>

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
                        <div className="bordered c-statblock-editor-headers">
                            <TextField label="Name" fieldName="Name" />
                            <TextField label="Folder" fieldName="Path" />
                            <TextField label="Portrait URL" fieldName="ImageURL" />
                            <TextField label="Source" fieldName="Source" />
                            <TextField label="Type" fieldName="Type" />
                        </div>
                        <div className="bordered c-statblock-editor-stats">
                            <TextField label={challengeLabel} fieldName="Challenge" />
                            {this.valueAndNotesField("Hit Points", "HP")}
                            {this.valueAndNotesField("Armor Class", "AC")}
                            {this.initiativeField()}
                        </div>
                        <div className="bordered c-statblock-editor-abilityscores">
                            {AbilityNames
                                .map(this.abilityScoreField)}
                        </div>
                        <div className="bordered c-statblock-editor-saves">
                            {this.nameAndModifierFields(api, "Saves")}
                        </div>
                        <div className="bordered c-statblock-editor-skills">
                            {this.nameAndModifierFields(api, "Skills")}
                        </div>
                        {["Speed", "Senses", "DamageVulnerabilities", "DamageResistances", "DamageImmunities", "ConditionImmunities", "Languages"].map(
                            keywordType =>
                                <div key={keywordType} className="bordered c-statblock-editor-keywords">
                                    {this.keywordFields(api, keywordType)}
                                </div>
                        )}
                        {["Traits", "Actions", "Reactions", "LegendaryActions"].map(
                            powerType =>
                                <div key={powerType} className="bordered c-statblock-editor-powers">
                                    {this.powerFields(api, powerType)}
                                </div>
                        )}
                        <div className="bordered c-statblock-editor-description">
                            {this.descriptionField()}
                        </div>
                        {}
                    </div>
                    <div className="c-statblock-editor-buttons">
                        <Button onClick={this.close} faClass="times" />
                        {this.props.onDelete && <Button onClick={this.delete} faClass="trash" />}
                        {this.props.onSaveAs && <Button onClick={() => this.saveAs(api.values)} faClass="plus" tooltip="Save as New" />}
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