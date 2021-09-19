import { Form, Formik } from "formik";
import React = require("react");
import { SavedEncounter } from "../../common/SavedEncounter";
import { TextField } from "./components/TextField";

export function SavedEncounterEditor(props: {
  savedEncounter: SavedEncounter;
  onSave: (newSavedEncounter: SavedEncounter) => void;
  onDelete: () => void;
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
            <TextField label="Saved Encounter Name" fieldName="Name" />
            <TextField label="Folder" fieldName="Path" />
          </Form>
        );
      }}
    />
  );
}
