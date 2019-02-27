import * as React from "react";
import { PlayerViewCustomStyles } from "../../../common/PlayerViewSettings";
import { CSSFrom } from "../../CSSFrom";

export class CustomStyles extends React.Component<{
  CustomCSS: string;
  CustomStyles: PlayerViewCustomStyles;
}> {
  public render() {
    return (
      <React.Fragment>
        <style
          dangerouslySetInnerHTML={{
            __html: CSSFrom(this.props.CustomStyles)
          }}
        />
        <style dangerouslySetInnerHTML={{ __html: this.props.CustomCSS }} />
      </React.Fragment>
    );
  }
}
