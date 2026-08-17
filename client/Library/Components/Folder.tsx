import * as React from "react";
import { RenameResult } from "../RenameResult";
import { InlineNameEditor } from "./InlineNameEditor";
import { ListingButton } from "./ListingButton";

interface FolderProps {
  name: string;
  /** Complete logical path; `name` contains only the displayed segment. */
  path: string;
  children: React.ReactNode;
  onRename?: (path: string, newName: string) => Promise<RenameResult>;
}

/** Renders one expandable library folder with an optional inline rename. */
export function Folder(props: FolderProps) {
  const [isOpen, setOpen] = React.useState(false);
  const [isRenaming, setRenaming] = React.useState(false);
  const toggleOpen = () => setOpen(!isOpen);
  return (
    <div
      className={
        "c-folder " +
        (isOpen ? "c-folder--open zebra-stripe" : "c-folder--closed")
      }
    >
      <li className="c-listing">
        {isRenaming ? (
          <InlineNameEditor
            name={props.name}
            onCancel={() => setRenaming(false)}
            onCommit={newName => props.onRename(props.path, newName)}
          />
        ) : (
          <ListingButton
            text={props.name}
            buttonClass="toggle"
            faClass={
              (isOpen ? "folder-open" : "folder") + " c-listing-button--wide"
            }
            onClick={toggleOpen}
          />
        )}
        {props.onRename && (
          <ListingButton
            title="Rename"
            buttonClass="edit"
            faClass="i-cursor"
            onClick={() => setRenaming(true)}
          />
        )}
      </li>
      {isOpen && props.children}
    </div>
  );
}
