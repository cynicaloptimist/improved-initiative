import { Formik, FormikProps } from "formik";
import * as React from "react";

export interface PromptProps<T> {
  onSubmit: (T) => boolean;
  children: React.ReactChild;
  autoFocusSelector: string;
  initialValues: T;
}

class Prompt<T> extends React.Component<PromptProps<T>> {
  private formElement: HTMLFormElement;

  public render() {
    return (
      <Formik
        initialValues={this.props.initialValues || {}}
        onSubmit={this.props.onSubmit}
        render={(props: FormikProps<any>) => (
          <form
            ref={r => (this.formElement = r)}
            className="prompt"
            onSubmit={props.handleSubmit}
          >
            {this.props.children}
          </form>
        )}
      />
    );
  }

  public componentDidMount() {
    setImmediate(this.delaySoHotkeyDoesntFillAutoselect);
  }

  private delaySoHotkeyDoesntFillAutoselect = () => {
    //prevent mounted element from swallowing hotkey
    const element: HTMLInputElement = this.formElement.querySelector(
      this.props.autoFocusSelector
    );
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
    return this.props.prompts.map(prompt => (
      <Prompt
        {...prompt}
        onSubmit={values => {
          const shouldResolve = prompt.onSubmit(values);
          if (shouldResolve) {
            this.props.removeResolvedPrompt(prompt);
          }
          return shouldResolve;
        }}
      />
    ));
  }
}
