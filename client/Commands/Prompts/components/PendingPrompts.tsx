import { Formik, FormikProps } from "formik";
import * as React from "react";
import { probablyUniqueString } from "../../../../common/Toolbox";

export interface PromptProps<T> {
  onSubmit: (T) => boolean;
  children: React.ReactChild;
  autoFocusSelector: string;
  initialValues: T;
}

class Prompt<T> extends React.Component<
  PromptProps<T> & {
    onCancel: () => void;
  }
> {
  private formElement: HTMLFormElement;

  private setFormElementRef = (r: HTMLFormElement) => {
    this.formElement = r;
  };

  public render() {
    return (
      <Formik
        initialValues={this.props.initialValues || {}}
        onSubmit={this.props.onSubmit}
        render={(props: FormikProps<any>) => (
          <form
            ref={this.setFormElementRef}
            className="prompt"
            onSubmit={props.handleSubmit}
            onKeyUp={(e: React.KeyboardEvent<HTMLFormElement>) => {
              if (e.key == "Escape") {
                this.props.onCancel();
              }
            }}
          >
            {this.props.children}
          </form>
        )}
      />
    );
  }

  public componentDidMount() {
    setImmediate(this.delaySoAutoFocusedFieldDoesntSwallowHotkey);
  }

  private delaySoAutoFocusedFieldDoesntSwallowHotkey = () => {
    if (this.formElement === null) {
      return console.error("Prompt unmounted before autofocus could occur!");
    }
    //prevent mounted element from swallowing hotkey
    const element: HTMLInputElement = this.formElement.querySelector(
      this.props.autoFocusSelector
    );
    if (element.focus) {
      element.focus();
    }
    if (element.select) {
      element.select();
    }
  };
}

interface PendingPromptsProps {
  prompts: PromptProps<unknown>[];
  removeResolvedPrompt: (prompt: PromptProps<unknown>) => void;
}

export class PendingPrompts extends React.Component<PendingPromptsProps> {
  public render() {
    return this.props.prompts.map((prompt, index) => (
      <Prompt
        key={index}
        {...prompt}
        onSubmit={values => {
          const shouldResolve = prompt.onSubmit(values);
          if (shouldResolve) {
            this.props.removeResolvedPrompt(prompt);
          }
          return shouldResolve;
        }}
        onCancel={() => {
          this.props.removeResolvedPrompt(prompt);
        }}
      />
    ));
  }
}
