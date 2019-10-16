import { ArrayHelpers, FieldArray, FormikProps } from "formik";
import React = require("react");
import { DndProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { Button } from "../../Components/Button";
import { useDragDrop, DropZone } from "./UseDragDrop";

type FormApi = FormikProps<any>;

type makeSortableComponent = (
  index: number,
  arrayHelpers: ArrayHelpers
) => JSX.Element;

export function SortableList(props: {
  api: FormApi;
  listType: string;
  makeComponent: makeSortableComponent;
  makeNew: () => any;
}) {
  return (
    <DndProvider backend={HTML5Backend}>
      <FieldArray
        name={props.listType}
        render={arrayHelpers => (
          <SortableListInner {...props} arrayHelpers={arrayHelpers} />
        )}
      />
    </DndProvider>
  );
}

function SortableListInner(props: {
  api: FormApi;
  arrayHelpers: ArrayHelpers;
  listType: string;
  makeComponent: makeSortableComponent;
  makeNew: () => any;
}) {
  const { api, arrayHelpers, listType, makeNew } = props;
  const addButton = (
    <Button
      fontAwesomeIcon="plus"
      additionalClassNames="c-add-button"
      onClick={() => arrayHelpers.push(makeNew())}
    />
  );

  if (api.values[listType].length == 0) {
    return (
      <span className="c-statblock-editor__label">
        {listType}
        {addButton}
      </span>
    );
  } else {
    const [, finalDrop, finalDropProps] = useDragDrop(
      listType,
      api.values[listType].length,
      arrayHelpers.move
    );
    return (
      <>
        <div className="c-statblock-editor__label">{listType}</div>
        {api.values[listType].map((_, i: number) =>
          props.makeComponent(i, arrayHelpers)
        )}
        <DropZone drop={finalDrop} dropProps={finalDropProps} />
        {addButton}
      </>
    );
  }
}
