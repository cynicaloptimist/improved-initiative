import * as React from "react";
import { Listable } from "../../../common/Listable";
import { Button } from "../../Components/Button";
import { Library } from "../Library";
import { Listing } from "../Listing";

export function MovePrompt(props: {
  targets: Listing<Listable>[];
  library: Library<Listable>;
  done: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>();
  return (
    <div
      className="prompt"
      style={{ flexDirection: "row", alignItems: "center" }}
    >
      <span style={{ flexGrow: 1 }}>Move selected items to folder</span>
      <input autoFocus ref={inputRef} />
      <Button
        fontAwesomeIcon="check"
        onClick={async () => {
          if (!inputRef.current) {
            return;
          }
          const pathInput = inputRef.current.value;
          await Promise.all(
            props.targets.map(async targetListing => {
              const item = await props.library.GetItemById(
                targetListing.Meta().Id
              );
              item.Path = pathInput;
              return await props.library.SaveEditedListing(targetListing, item);
            })
          );
          props.done();
        }}
      />
    </div>
  );
}
