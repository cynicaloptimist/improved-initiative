import * as React from "react";
import { ListingButton } from "./ListingButton";

export function Folder(props: { name: string; children: React.ReactNode }) {
  const [isOpen, setOpen] = React.useState(false);
  const toggleOpen = () => setOpen(!isOpen);
  return (
    <div
      className={
        "c-folder " +
        (isOpen ? "c-folder--open zebra-stripe" : "c-folder--closed")
      }
    >
      <li className="c-listing">
        <ListingButton
          text={props.name}
          buttonClass="toggle"
          faClass={
            (isOpen ? "folder-open" : "folder") + " c-listing-button--wide"
          }
          onClick={toggleOpen}
        />
      </li>
      {isOpen && props.children}
    </div>
  );
}
