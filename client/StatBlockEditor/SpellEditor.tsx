import * as React from "react";

import { Formik, Field, Form } from "formik";
import { Spell } from "../../common/Spell";
import { useState, useRef } from "react";
import { Button } from "../Components/Button";

export type SpellEditorProps = {
  spell: Spell;
  onSave: (newSpell: Spell) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

export function SpellEditor(props: SpellEditorProps) {
  const [editorMode, setEditorMode] = useState<"standard" | "json">("standard");
  const jsonEditor = useRef<HTMLTextAreaElement>(null);

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
      render={api => (
        <Form autoComplete="false">
          <h2>Edit Spell</h2>
          <div className="editor-type">
            Editor:
            <label>
              <input
                type="radio"
                checked={editorMode === "standard"}
                onChange={e => setEditorMode("standard")}
              />
              Form
            </label>
            <label>
              <input
                type="radio"
                checked={editorMode === "json"}
                onChange={e => setEditorMode("json")}
              />
              JSON
            </label>
          </div>
          {editorMode === "standard" && <StandardEditor />}
          {editorMode === "json" && (
            <textarea
              className="json-editor"
              spellCheck={false}
              ref={jsonEditor}
            />
          )}
          <div className="buttons">
            <Button
              type="submit"
              tooltip="Save changes to spell"
              fontAwesomeIcon="save"
            />
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
          </div>
        </Form>
      )}
    />
  );
}

function StandardEditor() {
  return (
    <div className="stats">
      <label>
        Name <Field className="name" name="Name" />
      </label>
      <label>
        Source <Field name="Source" />
      </label>
      <label>
        Level <Field name="Level" />
      </label>
      <label>
        School <Field name="School" />
      </label>
      <label>
        Casting Time <Field name="CastingTime" />
      </label>
      <label>
        Ritual <Field type="checkbox" name="Ritual" />
      </label>
      <label>
        Range <Field name="Range" />
      </label>
      <label>
        Components <Field name="Components" />
      </label>
      <label>
        Duration <Field name="Duration" />
      </label>
      <label>
        Classes
        <Field name="AllClasses" />
      </label>
      <label>Description</label>
      <textarea name="Description"></textarea>
    </div>
  );
}
