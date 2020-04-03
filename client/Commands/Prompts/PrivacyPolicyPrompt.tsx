import * as React from "react";
import { LegacySynchronousLocalStore } from "../../Utility/LegacySynchronousLocalStore";
import { Metrics } from "../../Utility/Metrics";
import { PromptProps } from "./PendingPrompts";
import ReactMarkdown = require("react-markdown");

const privacyPolicyText: string = require("../../../PRIVACY.md").default;

const promptClassName = "p-privacy-policy";

type PrivacyPolicyPromptProps = {
  callback: (optin: boolean) => void;
};

type PrivacyPolicyPromptModel = {
  optIn: boolean;
};

function PrivacyPolicyComponent(props: PrivacyPolicyPromptProps) {
  const [displayFullText, setDisplayFullText] = React.useState(false);
  const privacyBrief =
    "Improved Initiative has a privacy policy. Your data is never sold to third parties. You can help improve the app by sharing your usage data.";
  const moreInfoButton = (
    <a href="#" onClick={e => setDisplayFullText(true)}>
      More Info.
    </a>
  );

  const noThanksButton = (
    <input
      className={promptClassName + "-nothanks button"}
      type="submit"
      value="No Thanks"
      onClick={() => props.callback(false)}
    />
  );

  const optInButton = (
    <input
      className={promptClassName + "-optin button"}
      type="submit"
      value="Opt In"
      onClick={() => props.callback(true)}
    />
  );

  return (
    <div className={promptClassName}>
      <p>
        {privacyBrief} {moreInfoButton}
      </p>
      {displayFullText && (
        <ReactMarkdown
          className={promptClassName + "-full"}
          source={privacyPolicyText}
        />
      )}
      <div className={promptClassName + "-buttons"}>
        {noThanksButton}
        {optInButton}
      </div>
    </div>
  );
}

export function PrivacyPolicyPrompt(): PromptProps<PrivacyPolicyPromptModel> {
  return {
    autoFocusSelector: "." + promptClassName + "-optin",
    children: <PrivacyPolicyComponent callback={promptCallback} />,
    initialValues: { optIn: true },
    onSubmit: () => true
  };
}

function promptCallback(optIn: boolean) {
  if (optIn) {
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
}
