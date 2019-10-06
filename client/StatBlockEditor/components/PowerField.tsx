import { Field } from "formik";
import _ = require("lodash");
import * as React from "react";
import { useCallback, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";

interface PowerFieldProps {
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  powerType: string;
  index: number;
}

interface PowerFieldDragProps {
  type: "power-field";
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

  const dragDropType = "power-field-" + props.powerType;

  const [, drag] = useDrag({
    item: { index: props.index, type: dragDropType }
  });

  const [, drop] = useDrop({
    accept: dragDropType,
    drop: (item: PowerFieldDragProps) => {
      const from = item.index;
      const to = props.index;
      console.log("from", item.index, "to", to);
      if (to > from) {
        props.move(from, to - 1);
      } else {
        props.move(from, to);
      }
    }
  });

  return (
    <div>
      <div className="drop-zone" ref={drop} />
      <div className="inline">
        <div className="grab-handle" ref={drag} />
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
