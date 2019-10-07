import { Field, FieldArray, FormikProps } from "formik";
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

interface DraggedPowerField {
  type: "power-field";
  index: number;
}

export const PowerFields = (props: { api: FormApi; powerType: string }) => {
  const { api, powerType } = props;

  const useDragDrop = function(
    powerType: string,
    index: number,
    move: (from: number, to: number) => void
  ): [DragElementWrapper<DragSourceOptions>, DragElementWrapper<any>] {
    const dragDropType = "power-field-" + powerType;

    const [, drag] = useDrag({
      item: { index: index, type: dragDropType }
    });

    const [, drop] = useDrop({
      accept: dragDropType,
      drop: (item: DraggedPowerField) => {
        const from = item.index;
        const to = index;
        console.log("from", item.index, "to", to);
        if (to > from) {
          move(from, to - 1);
        } else {
          move(from, to);
        }
      }
    });

    return [drag, drop];
  };

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
            <DndProvider backend={HTML5Backend}>
              <div className="c-statblock-editor__label">{powerType}</div>
              <div className="inline-powers">
                {api.values[powerType].map((_, i: number) => (
                  <PowerField
                    key={i}
                    remove={arrayHelpers.remove}
                    move={arrayHelpers.move}
                    useDragDrop={useDragDrop}
                    powerType={powerType}
                    index={i}
                  />
                ))}
              </div>
              {addButton}
            </DndProvider>
          );
        }
      }}
    />
  );
};

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
