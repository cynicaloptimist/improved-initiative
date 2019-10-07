import { ArrayHelpers, FieldArray, FormikProps } from "formik";
import React = require("react");
import { DndProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { Button } from "../../Components/Button";
import { useDragDrop } from "./UseDragDrop";

type FormApi = FormikProps<any>;

type makeSortableComponent = (
  index: number,
  arrayHelpers: ArrayHelpers
) => JSX.Element;

export function SortableList(props: {
  api: FormApi;
  listType: string;
  makeComponent: makeSortableComponent;
}) {
  const { api, listType, makeComponent } = props;

  return (
    <DndProvider backend={HTML5Backend}>
      <FieldArray
        name={listType}
        render={arrayHelpers => (
          <SortableListInner
            api={api}
            listType={listType}
            arrayHelpers={arrayHelpers}
            makeComponent={makeComponent}
          />
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
}) {
  const { api, arrayHelpers, listType } = props;
  const addButton = (
    <Button
      fontAwesomeIcon="plus"
      additionalClassNames="c-add-button"
      onClick={() => arrayHelpers.push({ Name: "", Content: "", Usage: "" })}
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
    const [, finalDrop] = useDragDrop(
      listType,
      api.values[listType].length,
      arrayHelpers.move
    );
    return (
      <React.Fragment>
        <div className="c-statblock-editor__label">{listType}</div>
        <div className="inline-powers">
          {api.values[listType].map((_, i: number) =>
            props.makeComponent(i, arrayHelpers)
          )}
          <div className="drop-zone" ref={finalDrop} />
        </div>
        {addButton}
      </React.Fragment>
    );
  }
}
