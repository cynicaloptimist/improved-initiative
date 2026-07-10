import * as React from "react";
import { Field, FieldArray, FieldProps } from "formik";
import { Button } from "../../Components/Button";
import { Toggle } from "./Toggle";
import { Info } from "../../Components/Info";
import { Metrics } from "../../Utility/Metrics";

export const StatBlockCustomFields = () => {
  return (
    <FieldArray name="StatBlock.CustomFields">
      {arrayHelpers => (
        <div className="custom-statblock-fields">
          <h4>Custom Statblock Fields</h4>
          {arrayHelpers.form.values.StatBlock.CustomFields.map(
            (field, index) => (
              <div key={index} className="custom-field">
                <div className="c-input-with-label">
                  Field Name
                  <Field
                    name={`StatBlock.CustomFields.${index}.name`}
                    autoComplete="off"
                  />
                </div>
                <div className="c-input-with-label">
                  Default Value
                  <Field
                    name={`StatBlock.CustomFields.${index}.defaultValue`}
                    autoComplete="off"
                  />
                </div>
                <div className="c-input-with-label">
                  <span>
                    Display in Encounter View
                    <Info>Show the field inline in the combatant row</Info>
                  </span>
                  <Toggle
                    fieldName={`StatBlock.CustomFields.${index}.showInEncounterView`}
                  />
                </div>
                <div className="c-input-with-label">
                  Column Header
                  <Field
                    name={`StatBlock.CustomFields.${index}.combatantRowHeader`}
                    autoComplete="off"
                  />
                </div>
                <div className="c-input-with-label">
                  Column Width (px)
                  <Field
                    name={`StatBlock.CustomFields.${index}.combatantRowWidth`}
                    autoComplete="off"
                    type="number"
                  />
                </div>
                <div className="c-button-with-label">
                  Delete Custom Field
                  <Button
                    fontAwesomeIcon="trash"
                    onClick={() => arrayHelpers.remove(index)}
                  />
                </div>
                <hr />
              </div>
            )
          )}
          <Button
            type="button"
            onClick={() => {
              Metrics.TrackEvent(Metrics.Event.CustomStatBlockFieldAdded);
              return arrayHelpers.push({
                name: "",
                type: "string",
                defaultValue: "",
                showInEncounterView: false,
                combatantRowHeader: "",
                combatantRowWidth: 20
              });
            }}
            text="Add Custom Field"
          />
        </div>
      )}
    </FieldArray>
  );
};
