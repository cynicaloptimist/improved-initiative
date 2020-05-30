import * as React from "react";
import { PlayerViewCustomStyles } from "../../../common/PlayerViewSettings";
import { CSSFrom } from "../CSSFrom";

export class CustomStyles extends React.Component<{
  CustomCSS: string;
  CustomStyles: PlayerViewCustomStyles;
  TemporaryBackgroundImageUrl?: string;
}> {
  public render() {
    return (
      <>
        <style
          dangerouslySetInnerHTML={{
            __html: CSSFrom(
              this.props.CustomStyles,
              this.props.TemporaryBackgroundImageUrl
            )
          }}
        />
        <style dangerouslySetInnerHTML={{ __html: this.props.CustomCSS }} />
      </>
    );
  }
}
