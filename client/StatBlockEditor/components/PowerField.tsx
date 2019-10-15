import { Field } from "formik";
import _ = require("lodash");
import * as React from "react";
import { useCallback, useRef } from "react";
import { useDragDrop, DropZone } from "./UseDragDrop";

interface PowerFieldProps {
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  powerType: string;
  index: number;
}

export function PowerField(props: PowerFieldProps) {
  let nameInput = useRef({ value: "", focus: () => {} });

  useCallback(
    () => {
      if (nameInput.current.value == "") {
        nameInput.current.focus();
      }
    },
    [nameInput]
  );

  const [drag, drop, dropProps, preview] = useDragDrop(
    props.powerType,
    props.index,
    props.move
  );

  return (
    <div>
      <DropZone drop={drop} dropProps={dropProps} />
      <div className="inline" ref={preview}>
        <div className="grab-handle fas fa-grip-horizontal" ref={drag} />
        <Field
          type="text"
          className="name"
          placeholder="Name"
          name={`${props.powerType}[${props.index}].Name`}
          innerRef={f => (nameInput = f)}
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
    </div>
  );
}
