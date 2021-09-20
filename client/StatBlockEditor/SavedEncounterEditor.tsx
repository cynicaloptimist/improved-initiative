import { Form, Formik } from "formik";
import React = require("react");
import { SavedEncounter } from "../../common/SavedEncounter";
import { Button } from "../Components/Button";
import { TextField } from "./components/TextField";

export function SavedEncounterEditor(props: {
  savedEncounter: SavedEncounter;
  onSave: (newSavedEncounter: SavedEncounter) => void;
  onClose: () => void;
}) {
  return (
    <Formik
      initialValues={props.savedEncounter}
      onSubmit={props.onSave}
      children={api => {
        return (
          <Form
            className="c-statblock-editor"
            autoComplete="false"
            translate="no"
            onSubmit={api.handleSubmit}
          >
            <div className="c-statblock-editor__title-row">
              <h2 className="c-statblock-editor__title">
                Edit Saved Encounter`
              </h2>
              <Button
                onClick={props.onClose}
                tooltip="Cancel"
                fontAwesomeIcon="times"
              />
              <Button
                onClick={api.submitForm}
                tooltip="Save"
                fontAwesomeIcon="save"
              />
            </div>

            <TextField label="Saved Encounter Name" fieldName="Name" />
            <TextField label="Folder" fieldName="Path" />
          </Form>
        );
      }}
    />
  );
}
