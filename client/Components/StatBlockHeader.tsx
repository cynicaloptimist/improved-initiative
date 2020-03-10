import * as React from "react";

interface StatBlockHeaderProps {
  name: string;
  statBlockName?: string;
  type: string;
  source: string;
  imageUrl?: string;
}

interface StatBlockHeaderState {
  portraitSize: "thumbnail" | "full";
}

export class StatBlockHeader extends React.Component<
  StatBlockHeaderProps,
  StatBlockHeaderState
> {
  constructor(props) {
    super(props);
    this.state = { portraitSize: "thumbnail" };
  }

  public render() {
    const nameNeedsFallback =
      this.props.statBlockName &&
      this.props.name.indexOf(this.props.statBlockName) == -1;

    const statBlockName = (
      <span className="StatBlockName"> ({this.props.statBlockName})</span>
    );

    let header = (
      <div className="c-statblock-header">
        <h3 className="Name">
          {this.props.name}
          {nameNeedsFallback && statBlockName}
        </h3>
        <div className="Source">{this.props.source}</div>
        <div className="Type">{this.props.type}</div>
      </div>
    );

    if (this.props.imageUrl) {
      header = (
        <div
          className={`c-statblock-header__with-portrait--${this.state.portraitSize}`}
        >
          <img
            className={`c-statblock-header__portrait`}
            onClick={this.togglePortraitSize}
            src={this.props.imageUrl}
          />
          {header}
        </div>
      );
    }

    return header;
  }

  private togglePortraitSize = () => {
    if (this.state.portraitSize == "thumbnail") {
      this.setState({ portraitSize: "full" });
    } else {
      this.setState({ portraitSize: "thumbnail" });
    }
  };
}
