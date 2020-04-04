export interface LegacyPrompt {
  InputSelector: string;
  ComponentName: string;
  Resolve: (form: HTMLFormElement) => void;
}

export type LegacyPromptResolver = (responses: {
  [id: string]: string;
}) => void;
