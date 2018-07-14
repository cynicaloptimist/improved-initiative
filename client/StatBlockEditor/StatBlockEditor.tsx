import { Field, FieldArray, Form, Formik, FormikProps, FormikValues } from "formik";
import * as _ from "lodash";
import * as React from "react";
import { StatBlock } from "../../common/StatBlock";
import { probablyUniqueString } from "../../common/Toolbox";
import { Button } from "../Components/Button";
import { Listing } from "../Library/Listing";
import { IdentityFields } from "./components/IdentityFields";
import { KeywordField } from "./components/KeywordField";
import { NameAndModifierField } from "./components/NameAndModifierField";
import { PowerField } from "./components/PowerField";
import { TextField } from "./components/TextField";

type FormApi = FormikProps<any>;

const AbilityNames = ["Str", "Dex", "Con", "Int", "Wis", "Cha"];

const valueAndNotesField = (label: string, fieldName: string) =>
    <label className="c-statblock-editor__text">
        <span className="c-statblock-editor__label">{label}</span>
        <div className="inline">
            <Field type="number" className="value" name={`${fieldName}.Value`} />
            <Field type="text" className="notes" name={`${fieldName}.Notes`} />
        </div>
    </label>;

const initiativeField = () =>
    <div className="c-statblock-editor__text">
        <label className="c-statblock-editor__label" htmlFor="InitiativeModifier">Initiative Modifier</label>
        <div className="inline">
            <Field type="number" className="c-field__value" id="InitiativeModifier" name="InitiativeModifier" />
            <label> Roll with Advantage
                <Field type="checkbox" name="InitiativeAdvantage" />
            </label>
        </div>
    </div>;

const abilityScoreField = (abilityName: string) =>
    <div key={abilityName} className="c-statblock-editor__ability">
        <label htmlFor={`ability-${abilityName}`}>{abilityName}</label>
        <Field type="number" id={`ability-${abilityName}`} name={`Abilities.${abilityName}`} />
    </div>;

const nameAndModifierFields = (api: FormApi, modifierType: string) => {
    return <FieldArray name={modifierType} render={arrayHelpers => {

        const addButton = <button
            type="button"
            className="fa fa-plus c-add-button"
            onClick={() => arrayHelpers.push({ Name: "", Modifier: "" })} />;

        if (api.values[modifierType].length == 0) {
            return <span className="c-statblock-editor__label">
                {modifierType}
                {addButton}
            </span>
                ;
        } else {
            return <React.Fragment>
                <span className="c-statblock-editor__label">{modifierType}</span>
                <div className="inline-names-and-modifiers">
                    {api.values[modifierType].map((_, i: number) =>
                        <NameAndModifierField key={i} remove={arrayHelpers.remove} modifierType={modifierType} index={i} />
                    )}
                </div>
                {addButton}
            </React.Fragment>;
        }
    }} />;
};

const keywordFields = (api: FormApi, keywordType: string) => {
    return <FieldArray name={keywordType} render={arrayHelpers => {
        const addButton = <button
            type="button"
            className="fa fa-plus c-add-button"
            onClick={() => arrayHelpers.push("")} />;

        if (api.values[keywordType].length == 0) {
            return <span className="c-statblock-editor__label">
                {keywordType}
                {addButton}
            </span>;
        } else {
            return <React.Fragment>
                <span className="c-statblock-editor__label">{keywordType}</span>
                {api.values[keywordType].map((_, i: number) =>
                    <KeywordField key={i} remove={arrayHelpers.remove} keywordType={keywordType} index={i} />)}
                {addButton}
            </React.Fragment>;
        }
    }} />;
};

const powerFields = (api: FormApi, powerType: string) => {
    return <FieldArray name={powerType} render={arrayHelpers => {

        const addButton = <button type="button"
            className="fa fa-plus c-add-button"
            onClick={() => arrayHelpers.push({ Name: "", Content: "", Usage: "" })} />;

        if (api.values[powerType].length == 0) {
            return <span className="c-statblock-editor__label">
                {powerType}
                {addButton}
            </span>;
        } else {
            return <React.Fragment>
                <div className="c-statblock-editor__label">{powerType}</div>
                <div className="inline-powers">
                    {api.values[powerType].map((_, i: number) =>
                        <PowerField key={i} remove={arrayHelpers.remove} powerType={powerType} index={i} />)}
                </div>
                {addButton}
            </React.Fragment>;
        }
    }} />;
};

const descriptionField = () =>
    <label className="c-statblock-editor__text">
        <div className="c-statblock-editor__label">Description</div>
        <Field component="textarea" name="Description" />
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
        const saveAs = submittedValues.SaveAs;
        if (saveAs) {
            submittedValues.Id = probablyUniqueString();
            delete submittedValues.SaveAs;
        }

        this.parseIntWhereNeeded(submittedValues);
        const editedStatBlock = {
            ...StatBlock.Default(),
            ...this.props.statBlock,
            ...submittedValues,
        };

        if (saveAs && this.props.onSaveAs) {
            this.props.onSaveAs(editedStatBlock);
        } else {
            this.props.onSave(editedStatBlock);
        }
        this.props.onClose();
    }

    private close = () => {
        this.props.onClose();
    }

    private delete = () => {
        this.props.onDelete();
        this.props.onClose();
    }

    private willOverwriteStatBlock = _.memoize(
        (path: string, name: string) => this.props.currentListings.some(l => l.Path == path && l.Name == name),
        (path: string, name: string) => JSON.stringify({ path, name })
    );

    private validate = (values) => {
        const errors: any = {};
        if (!values.SaveAs) {
            return errors;
        }

        const path = values.Path || "";
        const name = values.Name || "";

        if (this.willOverwriteStatBlock(path, name)) {
            errors.PathAndName = "Warning: This will overwrite an existing custom statblock.";
        }

        return errors;
    }

    public render() {
        const header =
            this.props.editMode == "combatant" ? "Edit Combatant Statblock" :
                this.props.editMode == "library" ? "Edit Library Statblock" :
                    "Edit StatBlock";

        const challengeLabel = this.props.statBlock.Player == "player" ? "Level" : "Challenge";

        return <Formik
            onSubmit={this.saveAndClose}
            initialValues={this.props.statBlock}
            validate={this.validate}
            render={api => (
                <Form className="c-statblock-editor" autoComplete="false">
                    <h2>{header}</h2>
                    <div className="c-statblock-editor__identity">
                        <IdentityFields
                            formApi={api}
                            allowFolder={this.props.editMode === "library"}
                            allowSaveAs={this.props.onSaveAs !== undefined}
                            currentListings={this.props.currentListings}
                        />
                    </div>
                    <div className="c-statblock-editor__headers">
                        <TextField label="Portrait URL" fieldName="ImageURL" />
                        <TextField label="Source" fieldName="Source" />
                        <TextField label="Type" fieldName="Type" />
                    </div>
                    <div className="c-statblock-editor__stats">
                        <TextField label={challengeLabel} fieldName="Challenge" />
                        {valueAndNotesField("Hit Points", "HP")}
                        {valueAndNotesField("Armor Class", "AC")}
                        {initiativeField()}
                    </div>
                    <div className="c-statblock-editor__abilityscores">
                        {AbilityNames
                            .map(abilityScoreField)}
                    </div>
                    <div className="c-statblock-editor__saves">
                        {nameAndModifierFields(api, "Saves")}
                    </div>
                    <div className="c-statblock-editor__skills">
                        {nameAndModifierFields(api, "Skills")}
                    </div>
                    {["Speed", "Senses", "DamageVulnerabilities", "DamageResistances", "DamageImmunities", "ConditionImmunities", "Languages"]
                        .map(
                            keywordType =>
                                <div key={keywordType} className="c-statblock-editor__keywords">
                                    {keywordFields(api, keywordType)}
                                </div>
                        )}
                    {["Traits", "Actions", "Reactions", "LegendaryActions"].map(
                        powerType =>
                            <div key={powerType} className="c-statblock-editor__powers">
                                {powerFields(api, powerType)}
                            </div>
                    )}
                    <div className="c-statblock-editor__description">
                        {descriptionField()}
                    </div>

                    <div className="c-statblock-editor__buttons">
                        <Button onClick={this.close} fontAwesomeIcon="times" />
                        {this.props.onDelete && <Button onClick={this.delete} fontAwesomeIcon="trash" />}
                        <button type="submit" className="button fa fa-save" />
                    </div>
                </Form>
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
    currentListings?: Listing<StatBlock>[];
}

interface StatBlockEditorState { }