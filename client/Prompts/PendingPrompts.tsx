import { Formik, FormikProps } from "formik";
import * as React from "react";
import { Button } from "../Components/Button";

export interface PromptProps<T extends object> {
  onSubmit: (submittedValues: T) => boolean;
  onDismiss?: () => void;
  children: React.ReactChild;
  autoFocusSelector: string;
  initialValues: T;
}

class Prompt<T extends object> extends React.Component<
  PromptProps<T> & {
    onCancel: () => void;
    onCancelAll?: () => void;
  }
> {
  private formElement: HTMLFormElement | null = null;

  public render() {
    return (
      <Formik
        initialValues={this.props.initialValues || {}}
        onSubmit={values => {
          this.props.onSubmit(values);
        }}
      >
        {(props: FormikProps<any>) => (
          <form
            ref={r => (this.formElement = r)}
            className="prompt"
            onSubmit={props.handleSubmit}
            onKeyUp={(e: React.KeyboardEvent<HTMLFormElement>) => {
              if (e.key == "Escape") {
                this.props.onCancel();
              }
            }}
          >
            {this.props.children}
            <div className="prompt__utility-controls">
              {this.props.onCancelAll && (
                <Button
                  additionalClassNames="prompt__dismiss prompt__close-all"
                  ariaLabel="Close all"
                  fontAwesomeIcon="times"
                  onClick={this.props.onCancelAll}
                  text="All"
                  tooltip="Close all"
                />
              )}
              <Button
                additionalClassNames="prompt__dismiss prompt__close"
                ariaLabel="Close"
                fontAwesomeIcon="times"
                onClick={this.props.onCancel}
                tooltip="Close"
              />
            </div>
          </form>
        )}
      </Formik>
    );
  }

  public componentDidMount() {
    setTimeout(this.delaySoAutoFocusedFieldDoesntSwallowHotkey);
  }

  private delaySoAutoFocusedFieldDoesntSwallowHotkey = () => {
    if (!this.formElement) {
      return;
    }

    //prevent mounted element from swallowing hotkey
    const element = this.formElement.querySelector<HTMLInputElement>(
      this.props.autoFocusSelector
    );

    if (!element) {
      return;
    }

    if (element.focus) {
      element.focus();
    }
    if (element.select) {
      element.select();
    }
  };
}

interface PendingPromptsProps {
  promptsAndIds: [PromptProps<any>, string][];
  removePrompt: (promptId: string) => void;
}

export class PendingPrompts extends React.Component<PendingPromptsProps> {
  private dismissPrompt = (prompt: PromptProps<any>, promptId: string) => {
    if (prompt.onDismiss) {
      prompt.onDismiss();
    }
    this.props.removePrompt(promptId);
  };

  private dismissAllPrompts = () => {
    this.props.promptsAndIds
      .slice()
      .forEach(([prompt, promptId]) => this.dismissPrompt(prompt, promptId));
  };

  public render() {
    const emptyClassName =
      this.props.promptsAndIds.length == 0 ? " empty" : " tutorial-focus";
    return (
      <div className={"prompts" + emptyClassName}>
        {this.props.promptsAndIds.map(promptAndId => {
          const [prompt, promptId] = promptAndId;
          const canCloseAll = this.props.promptsAndIds.length > 1;

          return (
            <Prompt
              key={promptId}
              {...prompt}
              onSubmit={values => {
                const shouldResolve = prompt.onSubmit(values);
                if (shouldResolve) {
                  this.props.removePrompt(promptId);
                }
                return shouldResolve;
              }}
              onCancel={() => {
                this.dismissPrompt(prompt, promptId);
              }}
              onCancelAll={canCloseAll ? this.dismissAllPrompts : undefined}
            />
          );
        })}
      </div>
    );
  }
}
