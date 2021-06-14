import * as React from "react";
import { Listable } from "../../../common/Listable";
import { Button } from "../../Components/Button";
import { Info } from "../../Components/Info";
import { Listing } from "../Listing";
import { Library } from "../useLibrary";

export function MovePrompt(props: {
  targets: Listing<Listable>[];
  library: Library<Listable>;
  done: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>();
  const submit = async () => {
    if (!inputRef.current) {
      return;
    }
    const pathInput = inputRef.current.value;
    await Promise.all(
      props.targets.map(async targetListing => {
        const item = await targetListing.GetWithTemplate({
          ...targetListing.Meta(),
          Version: ""
        });
        item.Path = pathInput;
        return await props.library.SaveEditedListing(targetListing, item);
      })
    );
    props.done();
  };

  return (
    <div
      className="prompt"
      style={{ flexDirection: "row", alignItems: "center" }}
    >
      <span style={{ flexGrow: 1 }}>
        Move selected items to Folder
        <Info>You can use the "/" character to specify a subfolder</Info>
      </span>
      <input
        autoFocus
        ref={inputRef}
        onKeyDown={keyboardEvent => {
          if (keyboardEvent.key === "Enter") {
            submit();
          }
        }}
      />
      <Button fontAwesomeIcon="check" onClick={submit} />
    </div>
  );
}
