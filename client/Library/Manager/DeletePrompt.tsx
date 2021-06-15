import * as React from "react";
import { Listable } from "../../../common/Listable";
import { Button } from "../../Components/Button";
import { Listing } from "../Listing";
import { Library } from "../useLibrary";

export function DeletePrompt(props: {
  targets: Listing<Listable>[];
  library: Library<Listable>;
  done: () => void;
}) {
  return (
    <div
      className="prompt"
      style={{ flexDirection: "row", alignItems: "center" }}
    >
      <span style={{ flexGrow: 1, margin: 5 }}>
        <p>Are you sure you want to delete all of these items?</p>
        <p style={{ fontWeight: "bold" }}>
          {props.targets.map(t => t.Meta().Name).join(", ")}
        </p>
        <p>This operation cannot be undone.</p>
      </span>
      <Button fontAwesomeIcon="ban" text="Cancel" onClick={props.done} />
      <Button
        fontAwesomeIcon="trash"
        text="Delete All"
        onClick={async () => {
          await Promise.all(
            props.targets.map(async targetListing => {
              return await props.library.DeleteListing(targetListing.Meta().Id);
            })
          );
          props.done();
        }}
      />
    </div>
  );
}
