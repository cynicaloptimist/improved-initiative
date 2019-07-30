import { Field, FieldArray, FormikProps } from "formik";
import React = require("react");
import { StatBlock } from "../../../common/StatBlock";
import { Button } from "../../Components/Button";
import { KeywordField } from "./KeywordField";
import { NameAndComputedModifierField } from "./NameAndComputedModifierField";
import { NameAndModifierField } from "./NameAndModifierField";
import { PowerField } from "./PowerField";

type FormApi = FormikProps<any>;

export const ValueAndNotesField = (props: {
  label: string;
  fieldName: string;
}) => (
  <label className="c-statblock-editor__text">
    <span className="c-statblock-editor__label">{props.label}</span>
    <div className="inline">
      <Field
        type="number"
        className="value"
        name={`${props.fieldName}.Value`}
      />
      <Field type="text" className="notes" name={`${props.fieldName}.Notes`} />
    </div>
  </label>
);

export const InitiativeField = () => (
  <div className="c-statblock-editor__text">
    <label className="c-statblock-editor__label" htmlFor="InitiativeModifier">
      Initiative Modifier
    </label>
    <div className="inline">
      <Field
        type="number"
        className="c-field__value"
        id="InitiativeModifier"
        name="InitiativeModifier"
      />
      <label className="c-statblock-editor__initiative-special-roll">
        <Field component="select" name="InitiativeSpecialRoll">
          <option value="">-</option>
          <option value="advantage">Roll with Advantage</option>
          <option value="disadvantage">Roll with Disadvantage</option>
          <option value="take-ten">Take 10</option>
        </Field>
      </label>
    </div>
  </div>
);

export const abilityScoreField = (abilityName: string) => (
  <div key={abilityName} className="c-statblock-editor__ability">
    <label htmlFor={`ability-${abilityName}`}>{abilityName}</label>
    <Field
      type="number"
      id={`ability-${abilityName}`}
      name={`Abilities.${abilityName}`}
    />
  </div>
);

export const nameAndModifierFields = (api: FormApi, modifierType: string) => {
  return (
    <FieldArray
      name={modifierType}
      render={arrayHelpers => {
        const addButton = (
          <Button
            fontAwesomeIcon="plus"
            additionalClassNames="c-add-button"
            onClick={() => arrayHelpers.push({ Name: "", Modifier: "" })}
          />
        );

        if (api.values[modifierType].length == 0) {
          return (
            <span className="c-statblock-editor__label">
              {modifierType}
              {addButton}
            </span>
          );
        } else {
          return (
            <React.Fragment>
              <span className="c-statblock-editor__label">{modifierType}</span>
              <div className="inline-names-and-modifiers">
                {api.values[modifierType].map((_, i: number) => (
                  <NameAndModifierField
                    key={i}
                    remove={arrayHelpers.remove}
                    modifierType={modifierType}
                    index={i}
                  />
                ))}
              </div>
              {addButton}
            </React.Fragment>
          );
        }
      }}
    />
  );
};

export const nameAndComputedModifierFields = (
  api: FormApi,
  modifierType: string,
  fullBlock: StatBlock
) => {
  return (
    <FieldArray
      name={modifierType}
      render={arrayHelpers => {
        const addButton = (
          <Button
            fontAwesomeIcon="plus"
            additionalClassNames="c-add-button"
            onClick={() => arrayHelpers.push({ Name: "", Modifier: "" })}
          />
        );

        if (api.values[modifierType].length == 0) {
          return (
            <span className="c-statblock-editor__label">
              {modifierType}
              {addButton}
            </span>
          );
        } else {
          return (
            <React.Fragment>
              <span className="c-statblock-editor__label">{modifierType}</span>
              <div className="inline-names-and-modifiers">
                {api.values[modifierType].map((_, i: number) => (
                  <NameAndComputedModifierField
                    key={i}
                    remove={arrayHelpers.remove}
                    modifierType={modifierType}
                    index={i}
                    statBlock={fullBlock}
                  />
                ))}
              </div>
              {addButton}
            </React.Fragment>
          );
        }
      }}
    />
  );
};

export const keywordFields = (api: FormApi, keywordType: string) => {
  return (
    <FieldArray
      name={keywordType}
      render={arrayHelpers => {
        const addButton = (
          <Button
            fontAwesomeIcon="plus"
            additionalClassNames="c-add-button"
            onClick={() => arrayHelpers.push("")}
          />
        );

        if (api.values[keywordType].length == 0) {
          return (
            <span className="c-statblock-editor__label">
              {keywordType}
              {addButton}
            </span>
          );
        } else {
          return (
            <React.Fragment>
              <span className="c-statblock-editor__label">{keywordType}</span>
              {api.values[keywordType].map((_, i: number) => (
                <KeywordField
                  key={i}
                  remove={arrayHelpers.remove}
                  keywordType={keywordType}
                  index={i}
                />
              ))}
              {addButton}
            </React.Fragment>
          );
        }
      }}
    />
  );
};

export const powerFields = (api: FormApi, powerType: string) => {
  return (
    <FieldArray
      name={powerType}
      render={arrayHelpers => {
        const addButton = (
          <Button
            fontAwesomeIcon="plus"
            additionalClassNames="c-add-button"
            onClick={() =>
              arrayHelpers.push({ Name: "", Content: "", Usage: "" })
            }
          />
        );

        if (api.values[powerType].length == 0) {
          return (
            <span className="c-statblock-editor__label">
              {powerType}
              {addButton}
            </span>
          );
        } else {
          return (
            <React.Fragment>
              <div className="c-statblock-editor__label">{powerType}</div>
              <div className="inline-powers">
                {api.values[powerType].map((_, i: number) => (
                  <PowerField
                    key={i}
                    remove={arrayHelpers.remove}
                    powerType={powerType}
                    index={i}
                  />
                ))}
              </div>
              {addButton}
            </React.Fragment>
          );
        }
      }}
    />
  );
};

export const descriptionField = () => (
  <label className="c-statblock-editor__text">
    <div className="c-statblock-editor__label">Description</div>
    <Field
      className="c-statblock-editor__textarea"
      component="textarea"
      name="Description"
    />
  </label>
);

export const getAnonymizedStatBlockJSON = (statBlock: StatBlock) => {
  const { Name, Path, Id, ...anonymizedStatBlock } = statBlock;
  return JSON.stringify(anonymizedStatBlock, null, 2);
};
