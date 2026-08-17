import Tippy from "@tippyjs/react";
import * as React from "react";
import { RenameResult } from "../RenameResult";

interface InlineNameEditorProps {
  name: string;
  onCancel: () => void;
  onCommit: (name: string) => Promise<RenameResult>;
}

/**
 * Edits one display name in place and delegates persistence to an async
 * command. Enter commits; Escape and blur discard the draft.
 */
export function InlineNameEditor(props: InlineNameEditorProps): JSX.Element {
  const [name, setName] = React.useState(props.name);
  const [isSaving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const input = React.useRef<HTMLInputElement>();

  React.useEffect(() => {
    input.current?.focus();
  }, []);

  const commit = async () => {
    if (isSaving) {
      return;
    }

    setError(undefined);
    setSaving(true);
    const result = await props.onCommit(name);

    // Folder updates can rebuild the path-keyed tree before persistence reports
    // its final result. Do not update an editor that was removed by that rebuild.
    if (!input.current) {
      return;
    }

    if (result.success === true) {
      // Close the editor when a no-op rename leaves the existing row mounted.
      return props.onCancel();
    }

    setError(result.error || "Unexpected error");
    setSaving(false);
    input.current.focus();
  };

  return (
    <Tippy content={error} visible={Boolean(error)} theme="error-message">
      <input
        ref={input}
        className="c-listing-button--wide"
        value={name}
        readOnly={isSaving}
        onChange={event => {
          setName(event.target.value);
          setError(undefined);
        }}
        onBlur={() => {
          if (!isSaving) {
            props.onCancel();
          }
        }}
        onKeyDown={event => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          } else if (event.key === "Escape") {
            event.preventDefault();
            props.onCancel();
          }
        }}
      />
    </Tippy>
  );
}
