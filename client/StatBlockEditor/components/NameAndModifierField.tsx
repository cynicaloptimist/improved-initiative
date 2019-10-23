import { ArrayHelpers, Field } from "formik";
import * as React from "react";
import { useDrag } from "react-dnd";
import { useFocusIfEmpty } from "./useFocus";

interface NameAndModifierFieldProps {
  arrayHelpers: ArrayHelpers;
  modifierType: string;
  index: number;
}

export function NameAndModifierField(props: NameAndModifierFieldProps) {
  const nameInput = useFocusIfEmpty();

  const [, drag, preview] = useDrag({
    item: { index: props.index, type: props.modifierType }
  });

  return (
    <div className="inline" ref={preview}>
      <div className="grab-handle fas fa-grip-horizontal" ref={drag} />
      <Field
        type="text"
        className="name"
        name={`${props.modifierType}[${props.index}].Name`}
        innerRef={nameInput}
      />
      <Field
        type="number"
        className="modifier"
        name={`${props.modifierType}[${props.index}].Modifier`}
      />
      <span
        className="fa-clickable fa-trash"
        onClick={() => props.arrayHelpers.remove(props.index)}
      />
    </div>
  );
}
