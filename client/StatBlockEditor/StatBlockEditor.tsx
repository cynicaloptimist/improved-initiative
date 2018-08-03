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

const ValueAndNotesField = (props: { label: string, fieldName: string }) =>
    <label className="c-statblock-editor__text">
        <span className="c-statblock-editor__label">{props.label}</span>
        <div className="inline">
            <Field type="number" className="value" name={`${props.fieldName}.Value`} />
            <Field type="text" className="notes" name={`${props.fieldName}.Notes`} />
        </div>
    </label>;

const InitiativeField = () =>
    <div className="c-statblock-editor__text">
        <label className="c-statblock-editor__label" htmlFor="InitiativeModifier">Initiative Modifier</label>
        <div className="inline">
            <Field type="number" className="c-field__value" id="InitiativeModifier" name="InitiativeModifier" />
            <label className="c-statblock-editor__initiative-advantage">
                Roll with Advantage <Field type="checkbox" name="InitiativeAdvantage" />
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
        <Field className="c-statblock-editor__textarea" component="textarea" name="Description" />
    </label>;

const getAnonymizedStatBlockJSON = (statBlock: StatBlock) => {
    const { Name, Path, Id, ...anonymizedStatBlock } = statBlock;
    return JSON.stringify(anonymizedStatBlock, null, 2);
};

export class StatBlockEditor extends React.Component<StatBlockEditorProps, StatBlockEditorState> {
    constructor(props) {
        super(props);
        this.state = { editorMode: "standard" };
    }

    public render() {
        const header =
            this.props.editMode == "combatant" ? "Edit Combatant Statblock" :
                this.props.editMode == "library" ? "Edit Library Statblock" :
                    "Edit StatBlock";

        const buttons = <React.Fragment>
            <Button onClick={this.close} fontAwesomeIcon="times" />
            {this.props.onDelete && <Button onClick={this.delete} fontAwesomeIcon="trash" />}
            <button type="submit" className="button fa fa-save" />
        </React.Fragment>;

        const initialValues = {
            ...this.props.statBlock,
            StatBlockJSON: getAnonymizedStatBlockJSON(this.props.statBlock)
        };

        return <Formik
            onSubmit={this.saveAndClose}
            initialValues={initialValues}
            validate={this.validate}
            validateOnBlur
            render={api => (
                <Form className="c-statblock-editor" autoComplete="false">
                    <div className="c-statblock-editor__title-row">
                        <h2 className="c-statblock-editor__title">{header}</h2>
                        {buttons}
                    </div>
                    <div className="c-statblock-editor__identity">
                        <IdentityFields
                            formApi={api}
                            allowFolder={this.props.editMode === "library"}
                            allowSaveAs={this.props.onSaveAs !== undefined}
                            currentListings={this.props.currentListings}
                            setEditorMode={(editorMode: "standard" | "json") => this.setState({ editorMode })}
                        />
                    </div>
                    {
                        this.state.editorMode == "standard" ?
                            this.innerEditor(api) :
                            this.jsonEditor(api)
                    }
                    <div className="c-statblock-editor__buttons">
                        {buttons}
                    </div>
                </Form>
            )} />;
    }

    private innerEditor = (api: FormApi) => <React.Fragment>
        <div className="c-statblock-editor__headers">
            <TextField label="Portrait URL" fieldName="ImageURL" />
            <TextField label="Source" fieldName="Source" />
            <TextField label="Type" fieldName="Type" />
        </div>
        <div className="c-statblock-editor__stats">
            <TextField
                label={this.props.statBlock.Player == "player" ? "Level" : "Challenge"}
                fieldName="Challenge" />
            <ValueAndNotesField label="Hit Points" fieldName="HP" />
            <ValueAndNotesField label="Armor Class" fieldName="AC" />
            <InitiativeField />
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
    </React.Fragment>

    private jsonEditor = (api) => <div className="c-statblock-editor__json-section">
        <label className="c-statblock-editor__text">
            <div className="c-statblock-editor__label">JSON</div>
            <Field className="c-statblock-editor__json-textarea" component="textarea" name="StatBlockJSON" />
            {api.errors.JSONParseError}
        </label>
    </div>

    private parseIntWhereNeeded = (submittedValues: StatBlock) => {
        AbilityNames.forEach(a => submittedValues.Abilities[a] = this.castToNumberOrZero(submittedValues.Abilities[a]));
        submittedValues.HP.Value = this.castToNumberOrZero(submittedValues.HP.Value);
        submittedValues.AC.Value = this.castToNumberOrZero(submittedValues.AC.Value);
        submittedValues.InitiativeModifier = this.castToNumberOrZero(submittedValues.InitiativeModifier);
        submittedValues.Skills.forEach(s => s.Modifier = this.castToNumberOrZero(s.Modifier));
        submittedValues.Saves.forEach(s => s.Modifier = this.castToNumberOrZero(s.Modifier));
    }

    private castToNumberOrZero = (value?: any) => {
        if (!value) {
            return 0;
        }
        const parsedValue = parseInt(value.toString(), 10);
        if (parsedValue == NaN) {
            return 0;
        }
        return parsedValue;
    }    

    private saveAndClose = (submittedValues) => {
        const {
            SaveAs,
            StatBlockJSON,
            ...submittedStatBlock
        } = submittedValues;

        const statBlockFromEditorMode =
            this.state.editorMode == "standard" ?
                submittedStatBlock :
                JSON.parse(StatBlockJSON);

        const editedStatBlock = {
            ...StatBlock.Default(),
            ...statBlockFromEditorMode,
            Id: submittedStatBlock.Id,
            Name: submittedStatBlock.Name,
            Path: submittedStatBlock.Path,
            Version: process.env.VERSION,
        };

        this.parseIntWhereNeeded(editedStatBlock);

        if (SaveAs && this.props.onSaveAs) {
            editedStatBlock.Id = probablyUniqueString();
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
        if (confirm(`Delete Statblock for ${this.props.statBlock.Name}?`)) {
            this.props.onDelete();
            this.props.onClose();
        }
    }

    private willOverwriteStatBlock = _.memoize(
        (path: string, name: string) => this.props.currentListings.some(l => l.Path == path && l.Name == name),
        (path: string, name: string) => JSON.stringify({ path, name })
    );

    private validate = (values) => {
        const errors: any = {};

        if (_.isEmpty(values.Name)) {
            errors.NameMissing = "Error: Name is required.";
        }

        if (this.state.editorMode === "json") {
            try {
                JSON.parse(values.StatBlockJSON);
            } catch (e) {
                errors.JSONParseError = e.message;
            }
        }

        if (!values.SaveAs) {
            return errors;
        }

        const path = values.Path || "";
        const name = values.Name || "";

        if (this.willOverwriteStatBlock(path, name)) {
            errors.PathAndName = "Error: This will overwrite an existing custom statblock.";
        }

        return errors;
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

interface StatBlockEditorState {
    editorMode: "standard" | "json";
}