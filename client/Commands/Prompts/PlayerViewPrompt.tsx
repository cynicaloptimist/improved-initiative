import { Field } from "formik";
import * as React from "react";
import { Button, SubmitButton } from "../../Components/Button";
import { env } from "../../Environment";
import { PromptProps } from "./PendingPrompts";

const promptClassName = "p-launch-player-view";
const inputClassName = promptClassName + "-button";

interface PlayerViewPromptComponentProps {
  encounterId: string;
}

class PlayerViewPromptComponent extends React.Component<
  PlayerViewPromptComponentProps
> {
  private hiddenInput: HTMLInputElement;

  public render() {
    const playerViewUrl = `${env.BaseUrl}/p/${this.props.encounterId}`;
    return (
      <React.Fragment>
        <div className="launch-player-view">
          <input
            className="hidden-input"
            readOnly
            value={playerViewUrl}
            ref={e => (this.hiddenInput = e)}
          />
          <p>
            {`Player View launched. Encounter ID: `}
            <strong>{this.props.encounterId}</strong>
          </p>
          <Button
            fontAwesomeIcon="copy"
            text="Copy URL to clipboard"
            onClick={this.copyUrlToClipboard}
          />
          <Button
            fontAwesomeIcon="external-link-alt"
            text="Open Player View in new window"
            onClick={this.openPlayerViewWindow}
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
                Epic Initiative patrons can set a background image for your
                Player View.{" "}
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
      </React.Fragment>
    );
  }

  private copyUrlToClipboard = (e: React.MouseEvent<HTMLButtonElement>) => {
    this.hiddenInput.select();
    document.execCommand("copy");
    const button = e.target as HTMLButtonElement;
    button.focus();
  };

  private openPlayerViewWindow = () => {
    window.open(`/p/${this.props.encounterId}`, "Player View");
  };
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
