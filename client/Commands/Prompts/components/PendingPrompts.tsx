import { Formik, FormikProps } from "formik";
import * as React from "react";

export interface PromptProps<T> {
  onSubmit: (T) => boolean;
  children: React.ReactChild;
  initialValues?: T;
}

class Prompt<T> extends React.Component<PromptProps<T>> {
  public render() {
    return (
      <Formik
        initialValues={this.props.initialValues || {}}
        onSubmit={this.props.onSubmit}
        render={(props: FormikProps<any>) => (
          <form className="prompt" onSubmit={props.handleSubmit}>
            {this.props.children}
          </form>
        )}
      />
    );
  }
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
