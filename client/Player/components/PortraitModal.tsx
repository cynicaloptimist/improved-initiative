import * as React from "react";

export class PortraitModal extends React.Component<PortraitModalProps> {
  public render() {
    return (
      <div
        className="modal-blur combatant-portrait"
        onClick={this.props.onClose}
      >
        <img className="combatant-portrait__image" src={this.props.imageURL} />
        <div className="combatant-portrait__caption">{this.props.caption}</div>
      </div>
    );
  }
}
interface PortraitModalProps {
  imageURL: string;
  caption: string;
  onClose: () => void;
}
