import { Field } from "formik";
import * as React from "react";
import { Button, SubmitButton } from "../Components/Button";
import { env } from "../Environment";
import { PromptProps } from "./PendingPrompts";
import { useRef } from "react";
import { useCallback } from "react";
import { useState } from "react";

const promptClassName = "p-launch-player-view";
const inputClassName = promptClassName + "-button";

interface PlayerViewPromptComponentProps {
  encounterId: string;
  requestCustomEncounterId: (requestedId: string) => Promise<boolean>;
}

function PlayerViewPromptComponent(props: PlayerViewPromptComponentProps) {
  const [encounterId, setEncounterId] = useState(props.encounterId);
  const { targetInput, copyTargetInputToClipboard } = useCopyableText();

  const openPlayerViewWindow = useCallback(() => {
    window.open(`/p/${encounterId}`, "Player View");
  }, [encounterId]);

  const playerViewUrl = `${env.BaseUrl}/p/${encounterId}`;
  return (
    <>
      <div className="launch-player-view">
        <input
          className="hidden-input"
          readOnly
          value={playerViewUrl}
          ref={targetInput}
        />
        <p>
          {`Player View launched. Encounter ID: `}
          <strong>{encounterId}</strong>
        </p>
        <Button
          fontAwesomeIcon="copy"
          text="Copy URL to clipboard"
          onClick={copyTargetInputToClipboard}
        />
        <Button
          fontAwesomeIcon="external-link-alt"
          text="Open Player View in new window"
          onClick={openPlayerViewWindow}
          additionalClassNames={inputClassName}
        />
        {env.HasEpicInitiative ? (
          <>
            <label>
              {"Custom Encounter ID: "}
              <CustomEncounterId
                encounterId={encounterId}
                setEncounterId={setEncounterId}
                requestCustomEncounterId={props.requestCustomEncounterId}
              />
            </label>
            <label>
              {"Background Image URL: "}
              <Field type="text" name="backgroundImageUrl" />
            </label>
          </>
        ) : (
          <p>
            <label>
              Epic Initiative patrons can configure a custom Encounter Id and
              other features for the Player View.{" "}
            </label>
            <a
              href="https://www.patreon.com/bePatron?c=716070&amp;rid=1937132"
              target="_blank"
            >
              Pledge on Patreon
            </a>
          </p>
        )}
      </div>
      <SubmitButton />
    </>
  );
}

function useCopyableText() {
  const targetInput = useRef<HTMLInputElement>(null);

  const copyTargetInputToClipboard = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!targetInput.current) {
        return;
      }
      targetInput.current.select();
      document.execCommand("copy");
      const button = e.target as HTMLButtonElement;
      button.focus();
    },
    [targetInput.current]
  );

  return { targetInput, copyTargetInputToClipboard };
}

function CustomEncounterId(props: {
  encounterId: string;
  requestCustomEncounterId: (requestedId: string) => Promise<boolean>;
  setEncounterId: (newId: string) => void;
}) {
  const [status, setStatus] = useState<
    "unchanged" | "unavailable" | "successfulChange"
  >("unchanged");
  const [input, setInput] = useState(props.encounterId);

  return (
    <span>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <Button
        text="Request"
        disabled={props.encounterId == input || input.length < 4}
        onClick={async () => {
          const requestedId = input;
          if (requestedId === props.encounterId) {
            return;
          }

          const didGrantId = await props.requestCustomEncounterId(requestedId);

          if (didGrantId) {
            props.setEncounterId(requestedId);
            setStatus("successfulChange");
          } else {
            setStatus("unavailable");
          }
        }}
      />
      {status}
    </span>
  );
}

interface PlayerViewPromptModel {
  backgroundImageUrl: string;
}

export function PlayerViewPrompt(
  encounterId: string,
  currentBackgroundImageUrl: string,
  setBackgroundImageUrl: (url: string) => void,
  requestCustomEncounterId: (requestedId: string) => Promise<boolean>
): PromptProps<PlayerViewPromptModel> {
  return {
    initialValues: { backgroundImageUrl: currentBackgroundImageUrl },
    autoFocusSelector: "." + inputClassName,
    children: (
      <PlayerViewPromptComponent
        encounterId={encounterId}
        requestCustomEncounterId={requestCustomEncounterId}
      />
    ),
    onSubmit: (model: PlayerViewPromptModel) => {
      setBackgroundImageUrl(model.backgroundImageUrl);
      return true;
    }
  };
}
