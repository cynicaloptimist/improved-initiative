import { ArrayHelpers, Field } from "formik";
import * as React from "react";
import { useCallback, useRef } from "react";
import { useDragDrop, DropZone } from "./UseDragDrop";

interface KeywordFieldProps {
  arrayHelpers: ArrayHelpers;
  keywordType: string;
  index: number;
}

export function KeywordField(props: KeywordFieldProps) {
  let nameInput = useRef<HTMLInputElement>();
  useCallback(
    () => {
      if (nameInput.current.value == "") {
        nameInput.current.focus();
      }
    },
    [nameInput]
  );

  const [drag, drop, dropProps] = useDragDrop(
    props.keywordType,
    props.index,
    props.arrayHelpers.move
  );

  return (
    <React.Fragment>
      <DropZone drop={drop} dropProps={dropProps} />
      <div className="inline">
        <div className="grab-handle fas fa-grip-horizontal" ref={drag} />
        <Field
          type="text"
          className="name"
          name={`${props.keywordType}[${props.index}]`}
          innerRef={f => (nameInput = f)}
        />
        <span
          className="fa-clickable fa-trash"
          onClick={() => props.arrayHelpers.remove(props.index)}
        />
      </div>
    </React.Fragment>
  );
}
