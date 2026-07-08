import * as React from "react";

export function ReactMarkdown(props: {
  children?: string;
  components?: Record<string, React.ComponentType<any>>;
}): JSX.Element {
  const Paragraph = props.components?.p || "p";
  return <Paragraph>{props.children}</Paragraph>;
}
