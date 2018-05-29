import * as React from "react";
import { StatBlock } from "../../StatBlock/StatBlock";
import { Metrics } from "../../Utility/Metrics";
import { Prompt } from "./Prompt";

const privacyPolicyText: string = require("../../../PRIVACY.md");

const promptClassName = "p-privacy-policy";
const inputClassName = promptClassName + "-input";

interface PrivacyPolicyPromptProps { }
interface PrivacyPolicyPromptState { }
class PrivacyPolicyPrompt extends React.Component<PrivacyPolicyPromptProps, PrivacyPolicyPromptState> {

    public render() {
        return <div className={promptClassName}>
            <p>Improved Initiative has a privacy policy. Your data is never sold to third parties.</p>
            <div className={promptClassName + "-full"} dangerouslySetInnerHTML={{ __html: privacyPolicyText }} />
        </div>;
    }
}

export class PrivacyPolicyPromptWrapper implements Prompt {
    public InputSelector = "." + inputClassName;
    public ComponentName = "reactprompt";

    constructor() { }

    public Resolve = (form: HTMLFormElement) => {

    }

    private component = <PrivacyPolicyPrompt />;
}