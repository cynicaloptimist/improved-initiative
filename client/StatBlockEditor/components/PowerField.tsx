import { Field } from "formik";
import _ = require("lodash");
import * as React from "react";
import { useCallback, useRef } from "react";
import { DragElementWrapper, DragSourceOptions } from "react-dnd";

type UseDragDrop = (
  powerType: string,
  index: number,
  move: (from: number, to: number) => void
) => [DragElementWrapper<DragSourceOptions>, DragElementWrapper<any>];

interface PowerFieldProps {
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  useDragDrop: UseDragDrop;
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

  const [drag, drop] = props.useDragDrop(
    props.powerType,
    props.index,
    props.move
  );

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
