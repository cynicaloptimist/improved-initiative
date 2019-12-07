import * as React from "react";

interface ColorBlockProps {
  color: string;
  click: () => void;
}

export class ColorBlock extends React.Component<ColorBlockProps, {}> {
  public render() {
    const style = {
      backgroundColor: this.props.color
    };

    return (
      <span className="c-color-block" style={style} onClick={this.props.click} />
    );
  }
}
