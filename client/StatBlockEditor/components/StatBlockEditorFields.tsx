import { ArrayHelpers, Field, FormikProps } from "formik";
import React = require("react");
import { StatBlock } from "../../../common/StatBlock";
import { KeywordField } from "./KeywordField";
import { NameAndModifierField } from "./NameAndModifierField";
import { PowerField } from "./PowerField";
import { SortableList } from "./SortableList";

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
    <SortableList
      api={props.api}
      listType={props.modifierType}
      makeComponent={(index: number, arrayHelpers: ArrayHelpers) => (
        <NameAndModifierField
          key={index}
          arrayHelpers={arrayHelpers}
          modifierType={props.modifierType}
          index={index}
        />
      )}
      makeNew={() => ({ Name: "", Modifier: "" })}
    />
  );
};

export const KeywordFields = (props: { api: FormApi; keywordType: string }) => {
  return (
    <SortableList
      api={props.api}
      listType={props.keywordType}
      makeComponent={(index: number, arrayHelpers: ArrayHelpers) => (
        <KeywordField
          key={index}
          arrayHelpers={arrayHelpers}
          keywordType={props.keywordType}
          index={index}
        />
      )}
      makeNew={() => ""}
    />
  );
};

export function PowerFields(props: { api: FormApi; powerType: string }) {
  return (
    <SortableList
      api={props.api}
      listType={props.powerType}
      makeComponent={(index: number, arrayHelpers: ArrayHelpers) => (
        <PowerField
          key={index}
          remove={arrayHelpers.remove}
          move={arrayHelpers.move}
          powerType={props.powerType}
          index={index}
        />
      )}
      makeNew={() => ({ Name: "", Content: "", Usage: "" })}
    />
  );
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
