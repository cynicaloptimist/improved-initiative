import { Field } from "formik";
import * as React from "react";
import { Button, SubmitButton } from "../Components/Button";
import { env } from "../Environment";
import { PromptProps } from "./PendingPrompts";
import { useRef } from "react";
import { useCallback } from "react";

const promptClassName = "p-launch-player-view";
const inputClassName = promptClassName + "-button";

interface PlayerViewPromptComponentProps {
  encounterId: string;
}

function PlayerViewPromptComponent(props: PlayerViewPromptComponentProps) {
  const { hiddenInput, copyUrlToClipboard } = useCopyableText();

  const openPlayerViewWindow = useCallback(() => {
    window.open(`/p/${props.encounterId}`, "Player View");
  }, [props.encounterId]);

  const playerViewUrl = `${env.BaseUrl}/p/${props.encounterId}`;
  return (
    <>
      <div className="launch-player-view">
        <input
          className="hidden-input"
          readOnly
          value={playerViewUrl}
          ref={hiddenInput}
        />
        <p>
          {`Player View launched. Encounter ID: `}
          <strong>{props.encounterId}</strong>
        </p>
        <Button
          fontAwesomeIcon="copy"
          text="Copy URL to clipboard"
          onClick={copyUrlToClipboard}
        />
        <Button
          fontAwesomeIcon="external-link-alt"
          text="Open Player View in new window"
          onClick={openPlayerViewWindow}
          additionalClassNames={inputClassName}
        />
        {env.HasEpicInitiative ? (
          <label>
            {"Background Image URL: "}
            <Field type="text" name="backgroundImageUrl" />
          </label>
        ) : (
          <p>
            <label>
              Epic Initiative patrons can set a background image for your Player
              View.{" "}
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
  const hiddenInput = useRef<HTMLInputElement>(null);

  const copyUrlToClipboard = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!hiddenInput.current) {
        return;
      }
      hiddenInput.current.select();
      document.execCommand("copy");
      const button = e.target as HTMLButtonElement;
      button.focus();
    },
    [hiddenInput.current]
  );

  return { hiddenInput, copyUrlToClipboard };
}

interface PlayerViewPromptModel {
  backgroundImageUrl: string;
}

export function PlayerViewPrompt(
  encounterId: string,
  currentBackgroundImageUrl: string,
  setBackgroundImageUrl: (url: string) => void
): PromptProps<PlayerViewPromptModel> {
  return {
    initialValues: { backgroundImageUrl: currentBackgroundImageUrl },
    autoFocusSelector: "." + inputClassName,
    children: <PlayerViewPromptComponent encounterId={encounterId} />,
    onSubmit: (model: PlayerViewPromptModel) => {
      setBackgroundImageUrl(model.backgroundImageUrl);
      return true;
    }
  };
}
