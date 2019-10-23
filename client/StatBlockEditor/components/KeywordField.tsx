import { ArrayHelpers, Field } from "formik";
import * as React from "react";
import { useDrag } from "react-dnd";
import { useFocusIfEmpty } from "./useFocus";

interface KeywordFieldProps {
  arrayHelpers: ArrayHelpers;
  keywordType: string;
  index: number;
}

export function KeywordField(props: KeywordFieldProps) {
  const nameInput = useFocusIfEmpty();

  const [, drag, preview] = useDrag({
    item: { index: props.index, type: props.keywordType }
  });

  return (
    <div className="inline" ref={preview}>
      <div className="grab-handle fas fa-grip-horizontal" ref={drag} />
      <Field
        type="text"
        className="name"
        name={`${props.keywordType}[${props.index}]`}
        innerRef={nameInput}
      />
      <span
        className="fa-clickable fa-trash"
        onClick={() => props.arrayHelpers.remove(props.index)}
      />
    </div>
  );
}
