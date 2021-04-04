import * as React from "react";

import { Formik, Field, Form } from "formik";
import { Spell } from "../../common/Spell";
import { useState, useRef } from "react";
import { Button } from "../Components/Button";
import { ToggleButton } from "../Settings/components/Toggle";

export type SpellEditorProps = {
  spell: Spell;
  onSave: (newSpell: Spell) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

export function SpellEditor(props: SpellEditorProps) {
  const [editorMode, setEditorMode] = useState<"standard" | "json">("standard");
  const jsonEditor = useRef<HTMLTextAreaElement>(null);

  if (!props.spell) {
    return null;
  }

  const formValues = {
    ...props.spell,
    AllClasses: props.spell.Classes.join(", ")
  };

  return (
    <Formik
      onSubmit={submittedValues => {
        if (editorMode === "standard") {
          const { AllClasses, ...spell } = submittedValues;

          spell.Classes = AllClasses.split(",").map(c => c.trim());

          props.onSave(spell);
        }

        if (editorMode === "json") {
          const parsedSpellFromJSON = JSON.parse(jsonEditor.current?.value);
          const updatedSpell = {
            ...Spell.Default(),
            ...parsedSpellFromJSON
          };
          props.onSave(updatedSpell);
        }

        props.onClose();
      }}
      initialValues={formValues}
    >
      {() => (
        <Form autoComplete="false" className="spell-editor" translate="false">
          <h2>Edit Spell</h2>
          <div className="editor-type">
            <label>Editor Mode: </label>
            <Button onClick={() => setEditorMode("standard")} text="Standard" />
            <Button onClick={() => setEditorMode("json")} text="JSON" />
          </div>
          {editorMode === "standard" && <StandardEditor />}
          {editorMode === "json" && (
            <textarea
              className="json-editor"
              spellCheck={false}
              ref={jsonEditor}
              defaultValue={JSON.stringify(props.spell, null, 2)}
            />
          )}
          <div className="buttons">
            <Button
              tooltip="Cancel and revert spell"
              fontAwesomeIcon="times"
              onClick={props.onClose}
            />
            <Button
              tooltip="Delete spell"
              fontAwesomeIcon="trash"
              onClick={() => {
                if (confirm("Delete Spell?")) {
                  props.onDelete(props.spell.Id);
                  props.onClose();
                }
              }}
            />
            <Button
              type="submit"
              tooltip="Save changes to spell"
              fontAwesomeIcon="save"
            />
          </div>
        </Form>
      )}
    </Formik>
  );
}

function StandardEditor() {
  return (
    <div className="stats">
      <FieldRow label="Name" name="Name" />
      <FieldRow label="Source" name="Source" />
      <FieldRow label="Level" name="Level" />
      <FieldRow label="School" name="School" />
      <FieldRow label="Casting Time" name="CastingTime" />
      <label className="field-row">
        <span>Ritual</span>
        <ToggleButton fieldName="Ritual" />
      </label>
      <FieldRow label="Range" name="Range" />
      <FieldRow label="Components" name="Components" />
      <FieldRow label="Duration" name="Duration" />
      <FieldRow label="Classes" name="AllClasses" />
      <label>Description</label>
      <Field component="textarea" name="Description" />
    </div>
  );
}

function FieldRow(props: { label: string; name: string; type?: string }) {
  return (
    <label className="field-row">
      <span>{props.label}</span>
      <Field name={props.name} type={props.type} />
    </label>
  );
}
