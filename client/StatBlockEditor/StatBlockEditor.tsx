import { Field, Form, Formik, FormikProps } from "formik";
import * as _ from "lodash";
import moment = require("moment");
import * as React from "react";
import { Listable } from "../../common/Listable";
import { StatBlock } from "../../common/StatBlock";
import { probablyUniqueString } from "../../common/Toolbox";
import { Button, SubmitButton } from "../Components/Button";
import { Listing } from "../Library/Listing";
import { ConvertStringsToNumbersWhereNeeded } from "./ConvertStringsToNumbersWhereNeeded";
import { EnumToggle } from "./EnumToggle";
import { IdentityFields } from "./components/IdentityFields";
import {
  abilityScoreField,
  getAnonymizedStatBlockJSON,
  DescriptionField,
  InitiativeField,
  KeywordFields,
  NameAndModifierFields,
  PowerFields,
  ValueAndNotesField
} from "./components/StatBlockEditorFields";
import { TextField } from "./components/TextField";

export type StatBlockEditorTarget =
  | "library"
  | "combatant"
  | "persistentcharacter";

export interface StatBlockEditorProps {
  statBlock: StatBlock;
  onSave: (statBlock: StatBlock) => void;
  onDelete?: () => void;
  onSaveAsCopy?: (statBlock: StatBlock) => void;
  onSaveAsCharacter?: (statBlock: StatBlock) => void;
  onClose: () => void;
  editorTarget: StatBlockEditorTarget;
  currentListings?: Listing<Listable>[];
}

interface StatBlockEditorState {
  editorMode: "standard" | "json";
  renderError?: string;
}

export class StatBlockEditor extends React.Component<
  StatBlockEditorProps,
  StatBlockEditorState
> {
  constructor(props) {
    super(props);
    this.state = { editorMode: "standard" };
  }

  public componentDidCatch(error, info) {
    this.setState({
      editorMode: "json",
      renderError: JSON.stringify(error)
    });
  }

  public render() {
    if (!this.props.statBlock) {
      return null;
    }

    const header =
      {
        combatant: "Edit Combatant Statblock",
        library: "Edit Library Statblock",
        persistentcharacter: "Edit Character Statblock"
      }[this.props.editorTarget] || "Edit StatBlock";

    const buttons = (
      <>
        <Button onClick={this.close} fontAwesomeIcon="times" />
        {this.props.onDelete && (
          <Button onClick={this.delete} fontAwesomeIcon="trash" />
        )}
        <SubmitButton fontAwesomeIcon="save" />
      </>
    );

    const initialValues = {
      ...this.props.statBlock,
      StatBlockJSON: getAnonymizedStatBlockJSON(this.props.statBlock)
    };

    return (
      <Formik
        onSubmit={this.saveAndClose}
        initialValues={initialValues}
        validate={this.validate}
        validateOnBlur
      >
        {api => (
          <Form
            className="c-statblock-editor"
            autoComplete="false"
            translate="no"
          >
            <div className="c-statblock-editor__title-row">
              <h2 className="c-statblock-editor__title">{header}</h2>
              {buttons}
            </div>
            <div className="c-statblock-editor__identity">
              <IdentityFields
                formApi={api}
                allowFolder={
                  this.props.editorTarget === "library" ||
                  this.props.editorTarget === "persistentcharacter"
                }
                allowSaveAsCopy={this.props.onSaveAsCopy !== undefined}
                allowSaveAsCharacter={
                  this.props.onSaveAsCharacter !== undefined
                }
                currentListings={this.props.currentListings}
                setEditorMode={(editorMode: "standard" | "json") =>
                  this.setState({ editorMode })
                }
              />
            </div>
            {this.state.editorMode == "standard"
              ? this.fieldEditor(api)
              : this.jsonEditor(api)}
            <div className="c-statblock-editor__buttons">{buttons}</div>
          </Form>
        )}
      </Formik>
    );
  }

  private fieldEditor = (api: FormikProps<any>) => (
    <>
      <div className="c-statblock-editor__headers">
        <TextField label="Portrait URL" fieldName="ImageURL" />
        <TextField label="Source" fieldName="Source" />
        <TextField label="Type" fieldName="Type" />
        {this.props.editorTarget == "persistentcharacter" && (
          <EnumToggle
            labelsByOption={{
              "": "Non Player Character",
              player: "Player Character"
            }}
            fieldName="Player"
          />
        )}
      </div>
      <div className="c-statblock-editor__stats">
        <TextField
          label={
            this.props.statBlock.Player == "player" ? "Level" : "Challenge"
          }
          fieldName="Challenge"
        />
        <ValueAndNotesField label="Hit Points" fieldName="HP" />
        <ValueAndNotesField label="Armor Class" fieldName="AC" />
        <InitiativeField />
      </div>
      <div className="c-statblock-editor__abilityscores">
        {StatBlock.AbilityNames.map(abilityScoreField)}
      </div>
      <div className="c-statblock-editor__saves">
        <NameAndModifierFields api={api} modifierType="Saves" />
      </div>
      <div className="c-statblock-editor__skills">
        <NameAndModifierFields api={api} modifierType="Skills" />
      </div>
      {[
        "Speed",
        "Senses",
        "DamageVulnerabilities",
        "DamageResistances",
        "DamageImmunities",
        "ConditionImmunities",
        "Languages"
      ].map(keywordType => (
        <div key={keywordType} className="c-statblock-editor__keywords">
          <KeywordFields api={api} keywordType={keywordType} />
        </div>
      ))}
      {["Traits", "Actions", "Reactions", "LegendaryActions"].map(powerType => (
        <div key={powerType} className="c-statblock-editor__powers">
          <PowerFields api={api} powerType={powerType} />
        </div>
      ))}
      <DescriptionField />
    </>
  );

  private jsonEditor = api => (
    <div className="c-statblock-editor__json-section">
      {this.state.renderError && (
        <p className="c-statblock-editor__error">
          There was a problem with your statblock JSON, falling back to JSON
          editor.
        </p>
      )}
      {api.errors.JSONParseError && (
        <p className="c-statblock-editor__error">{api.errors.JSONParseError}</p>
      )}
      <label className="c-statblock-editor__text">
        <div className="c-statblock-editor__label">JSON</div>
        <Field
          className="c-statblock-editor__json-textarea"
          component="textarea"
          name="StatBlockJSON"
        />
      </label>
    </div>
  );

  private saveAndClose = submittedValues => {
    const {
      SaveAs,
      SaveAsCharacter,
      StatBlockJSON,
      ...submittedStatBlock
    } = submittedValues;

    let statBlockFromActiveEditor: StatBlock;
    if (this.state.editorMode == "standard") {
      statBlockFromActiveEditor = submittedStatBlock;
    } else {
      statBlockFromActiveEditor = JSON.parse(StatBlockJSON);
    }

    const editedStatBlock: StatBlock = {
      ...StatBlock.Default(),
      ...statBlockFromActiveEditor,
      Id: submittedStatBlock.Id,
      Name: submittedStatBlock.Name,
      Path: submittedStatBlock.Path,
      Version: process.env.VERSION || "unknown"
    };

    ConvertStringsToNumbersWhereNeeded(editedStatBlock);

    if (SaveAsCharacter && this.props.onSaveAsCharacter) {
      editedStatBlock.Id = probablyUniqueString();
      this.props.onSaveAsCharacter(editedStatBlock);
    } else if (SaveAs && this.props.onSaveAsCopy) {
      editedStatBlock.Id = probablyUniqueString();
      this.props.onSaveAsCopy(editedStatBlock);
    } else {
      this.props.onSave(editedStatBlock);
    }

    this.props.onClose();
  };

  private close = () => {
    this.props.onClose();
  };

  private delete = () => {
    if (
      this.props.onDelete &&
      confirm(`Delete Statblock for ${this.props.statBlock.Name}?`)
    ) {
      this.props.onDelete();
      this.props.onClose();
    }
  };

  private willOverwriteStatBlock = _.memoize(
    (path: string, name: string) =>
      this.props.currentListings?.some(
        l => l.Meta().Path == path && l.Meta().Name == name
      ),
    (path: string, name: string) => JSON.stringify({ path, name })
  );

  private validate = values => {
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
      errors.PathAndName =
        "Error: This will overwrite an existing custom statblock.";
    }

    return errors;
  };
}
