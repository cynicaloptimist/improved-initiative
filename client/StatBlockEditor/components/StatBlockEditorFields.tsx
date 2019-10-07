import { ArrayHelpers, Field, FieldArray, FormikProps } from "formik";
import React = require("react");
import {
  useDrag,
  useDrop,
  DndProvider,
  DragElementWrapper,
  DragSourceOptions
} from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { StatBlock } from "../../../common/StatBlock";
import { Button } from "../../Components/Button";
import { KeywordField } from "./KeywordField";
import { NameAndModifierField } from "./NameAndModifierField";
import { PowerField } from "./PowerField";
import { useDragDrop } from "./UseDragDrop";

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

export const NameAndModifierFields = (props: {
  api: FormApi;
  modifierType: string;
}) => {
  return (
    <FieldArray
      name={props.modifierType}
      render={arrayHelpers => {
        const addButton = (
          <Button
            fontAwesomeIcon="plus"
            additionalClassNames="c-add-button"
            onClick={() => arrayHelpers.push({ Name: "", Modifier: "" })}
          />
        );

        if (props.api.values[props.modifierType].length == 0) {
          return (
            <span className="c-statblock-editor__label">
              {props.modifierType}
              {addButton}
            </span>
          );
        } else {
          return (
            <React.Fragment>
              <span className="c-statblock-editor__label">
                {props.modifierType}
              </span>
              <div className="inline-names-and-modifiers">
                {props.api.values[props.modifierType].map((_, i: number) => (
                  <NameAndModifierField
                    key={i}
                    remove={arrayHelpers.remove}
                    modifierType={props.modifierType}
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

export const KeywordFields = (props: { api: FormApi; keywordType: string }) => {
  const { keywordType, api } = props;
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

export const PowerFields = (props: { api: FormApi; powerType: string }) => {
  const { api, powerType } = props;

  return (
    <DndProvider backend={HTML5Backend}>
      <FieldArray
        name={powerType}
        render={arrayHelpers => (
          <PowerFieldsInner
            api={api}
            powerType={powerType}
            arrayHelpers={arrayHelpers}
          />
        )}
      />
    </DndProvider>
  );
};

function PowerFieldsInner(props: {
  api: FormApi;
  arrayHelpers: ArrayHelpers;
  powerType: string;
}) {
  const { api, arrayHelpers, powerType } = props;
  const addButton = (
    <Button
      fontAwesomeIcon="plus"
      additionalClassNames="c-add-button"
      onClick={() => arrayHelpers.push({ Name: "", Content: "", Usage: "" })}
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
    const [, finalDrop] = useDragDrop(
      powerType,
      api.values[powerType].length,
      arrayHelpers.move
    );
    return (
      <React.Fragment>
        <div className="c-statblock-editor__label">{powerType}</div>
        <div className="inline-powers">
          {api.values[powerType].map((_, i: number) => (
            <PowerField
              key={i}
              remove={arrayHelpers.remove}
              move={arrayHelpers.move}
              powerType={powerType}
              index={i}
            />
          ))}
          <div className="drop-zone" ref={finalDrop} />
        </div>
        {addButton}
      </React.Fragment>
    );
  }
}

export const DescriptionField = () => (
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
