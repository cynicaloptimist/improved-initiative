import { Field } from "formik";
import _ = require("lodash");
import * as React from "react";
import { useDrag } from "react-dnd";
import { useFocusIfEmpty } from "./useFocus";

interface PowerFieldProps {
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  powerType: string;
  index: number;
}

export function PowerField(props: PowerFieldProps) {
  const nameInput = useFocusIfEmpty();

  const [, drag, preview] = useDrag({
    item: { index: props.index, type: props.powerType }
  });

  return (
    <>
      <div className="inline" ref={preview}>
        <div className="grab-handle fas fa-grip-horizontal" ref={drag} />
        <Field
          type="text"
          className="name"
          placeholder="Name"
          name={`${props.powerType}[${props.index}].Name`}
          innerRef={nameInput}
        />
        <span
          className="fa-clickable fa-trash"
          onClick={() => props.remove(props.index)}
        />
      </div>
      <Field
        className="c-statblock-editor__textarea"
        component="textarea"
        placeholder="Details"
        name={`${props.powerType}[${props.index}].Content`}
      />
    </>
  );
}
