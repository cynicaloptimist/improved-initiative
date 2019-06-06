import { Field } from "formik";
import * as React from "react";
import { Button, SubmitButton } from "../../Components/Button";
import { env } from "../../Environment";
import { PromptProps } from "./components/PendingPrompts";

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
    const playerViewUrl = `${env.CanonicalURL}/p/${this.props.encounterId}`;
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
          {env.HasEpicInitiative && (
            <label>
              Background Image URL
              <Field type="text" name="backgroundImageUrl" />
            </label>
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
  setBackgroundImageUrl: (url: string) => void
): PromptProps<PlayerViewPromptModel> {
  return {
    initialValues: { backgroundImageUrl: "" },
    autoFocusSelector: "." + inputClassName,
    children: <PlayerViewPromptComponent encounterId={encounterId} />,
    onSubmit: (model: PlayerViewPromptModel) => {
      if (model.backgroundImageUrl.length) {
        setBackgroundImageUrl(model.backgroundImageUrl);
      }
      return true;
    }
  };
}
