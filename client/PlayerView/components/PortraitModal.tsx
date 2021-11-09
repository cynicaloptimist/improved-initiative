import * as React from "react";

export class PortraitWithCaption extends React.Component<
  PortraitWithCaptionProps
> {
  public render() {
    return (
      <div
        data-testid="combatant-portrait"
        className="combatant-portrait"
        onClick={this.props.onClose}
      >
        <img className="combatant-portrait__image" src={this.props.imageURL} />
        <div className="combatant-portrait__caption">{this.props.caption}</div>
      </div>
    );
  }
}
interface PortraitWithCaptionProps {
  imageURL: string;
  caption: string;
  onClose: () => void;
}
