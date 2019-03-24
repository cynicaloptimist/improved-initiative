import * as React from "react";
import { tips } from "../Tips";

interface TipCarouselProps {}

interface TipCarouselState {
  tipIndex: number;
}

export class TipCarousel extends React.Component<
  TipCarouselProps,
  TipCarouselState
> {
  constructor(props) {
    super(props);
    this.state = {
      tipIndex: 0
    };
  }

  public render() {
    const currentTip = tips[this.state.tipIndex];
    return (
      <div className="tips">
        <span
          className="fa-arrow-left fa-clickable"
          onClick={this.previousTip}
          title="Previous Tip"
        />
        <span
          className="tip"
          dangerouslySetInnerHTML={{
            __html: currentTip
          }}
        />
        <span
          className="fa-arrow-right fa-clickable"
          onClick={this.nextTip}
          title="Next Tip"
        />
      </div>
    );
  }

  private nextTip = () => this.navigateTips(1);
  private previousTip = () => this.navigateTips(-1);

  private navigateTips = (offset: number) =>
    this.setState(state => ({
      tipIndex: (state.tipIndex + tips.length + offset) % tips.length
    }));
}
