import * as React from "react";
import { Button } from "../../Components/Button";

export function LibraryManagerToolbar(props: { closeManager: () => void }) {
  return (
    <div className="c-toolbar commands-library-manager">
      <Button
        additionalClassNames="c-button--return"
        tooltip="Return to Tracker View"
        tooltipProps={{
          placement: "right",
          delay: 1000
        }}
        onClick={() => props.closeManager()}
        fontAwesomeIcon={"arrow-left"}
      />
    </div>
  );
}
