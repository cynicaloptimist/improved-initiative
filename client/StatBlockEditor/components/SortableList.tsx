import { ArrayHelpers, FieldArray, FormikProps } from "formik";
import React = require("react");
import { Button } from "../../Components/Button";
import { DropZone } from "./UseDragDrop";

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
    <FieldArray
      name={props.listType}
      render={arrayHelpers => (
        <SortableListInner {...props} arrayHelpers={arrayHelpers} />
      )}
    />
  );
}

function SortableListInner(props: {
  api: FormApi;
  arrayHelpers: ArrayHelpers;
  listType: string;
  makeComponent: makeSortableComponent;
  makeNew: () => any;
}) {
  const { api, arrayHelpers, listType, makeComponent, makeNew } = props;
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
    return (
      <>
        <div className="c-statblock-editor__label">{listType}</div>
        {api.values[listType].map((_, i: number) => (
          <React.Fragment key={i}>
            <DropZone
              index={i}
              dragDropType={props.listType}
              move={props.arrayHelpers.move}
            />
            {makeComponent(i, arrayHelpers)}
          </React.Fragment>
        ))}
        <DropZone
          index={api.values[listType].length}
          dragDropType={props.listType}
          move={props.arrayHelpers.move}
        />
        {addButton}
      </>
    );
  }
}
