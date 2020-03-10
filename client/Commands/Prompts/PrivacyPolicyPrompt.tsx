import * as React from "react";
import { LegacySynchronousLocalStore } from "../../Utility/LegacySynchronousLocalStore";
import { Metrics } from "../../Utility/Metrics";
import { LegacyPrompt } from "./Prompt";

const privacyPolicyText: string = require("../../../PRIVACY.md");

const promptClassName = "p-privacy-policy";
const inputClassName = promptClassName + "-input";

interface PrivacyPolicyPromptProps {
  callback: (optin: boolean) => void;
}
interface PrivacyPolicyPromptState {
  displayFullText: boolean;
}
class PrivacyPolicyPromptComponent extends React.Component<
  PrivacyPolicyPromptProps,
  PrivacyPolicyPromptState
> {
  constructor(props) {
    super(props);
    this.state = { displayFullText: false };
  }

  public render() {
    const privacyBrief =
      "Improved Initiative has a privacy policy. Your data is never sold to third parties. You can help improve the app by sharing your usage data.";
    const moreInfoButton = (
      <a href="#" onClick={e => this.setState({ displayFullText: true })}>
        More Info.
      </a>
    );

    const noThanksButton = (
      <input
        className={promptClassName + "-nothanks button"}
        type="submit"
        value="No Thanks"
        onClick={() => this.props.callback(false)}
      />
    );
    const optInButton = (
      <input
        className={promptClassName + "-optin button"}
        type="submit"
        value="Opt In"
        onClick={() => this.props.callback(true)}
      />
    );

    return (
      <div className={promptClassName}>
        <p>
          {privacyBrief} {moreInfoButton}
        </p>
        {this.state.displayFullText && (
          <div
            className={promptClassName + "-full"}
            dangerouslySetInnerHTML={{ __html: privacyPolicyText }}
          />
        )}
        <div className={promptClassName + "-buttons"}>
          {noThanksButton}
          {optInButton}
        </div>
      </div>
    );
  }
}

export class PrivacyPolicyPrompt implements LegacyPrompt {
  public InputSelector = "." + inputClassName;
  public ComponentName = "reactprompt";

  constructor() {}

  private promptCallback = (optin: boolean) => {
    if (optin) {
      LegacySynchronousLocalStore.Save(
        LegacySynchronousLocalStore.User,
        "AllowTracking",
        true
      );
      Metrics.TrackLoad();
    } else {
      LegacySynchronousLocalStore.Save(
        LegacySynchronousLocalStore.User,
        "AllowTracking",
        false
      );
    }
  };

  public Resolve = (form: HTMLFormElement) => {};

  public component = (
    <PrivacyPolicyPromptComponent callback={this.promptCallback} />
  );
}
