import * as React from "react";
import { env } from "../../Environment";
import { tips } from "../Tips";

interface AboutProps {
  repeatTutorial: () => void;
  reviewPrivacyPolicy: () => void;
}

interface AboutState {
  tipIndex: number;
}
export class About extends React.Component<AboutProps, AboutState> {
  constructor(props) {
    super(props);
    this.state = {
      tipIndex: 0
    };
  }

  public render() {
    const currentTip = tips[this.state.tipIndex];
    return (
      <div className="tab-content about">
        <div>
          <p>
            <strong>Improved Initiative</strong>
            {" was created by "}
            <a href="mailto:improvedinitiativedev@gmail.com">Evan Bailey</a>
            {". All Wizards of the Coast content provided under terms of the "}
            <a href={env.CanonicalURL + "/SRD-OGL_V1.1.pdf"} target="_blank">
              Open Gaming License Version 1.0a
            </a>
            {"."}
          </p>
        </div>
        <div className="support">
          Love Improved Initiative?
          <div
            className="fb-like"
            data-href="https://www.facebook.com/improvedinitiativeapp/"
            data-layout="button"
            data-action="recommend"
            data-size="large"
            data-show-faces="false"
            data-share="false"
          />
          <a
            className="pledge"
            href="https://www.patreon.com/improvedinitiative"
            target="_blank"
          >
            <img src="/img/become_a_patron_button.png" />
          </a>
        </div>
        <h2>Did you know?</h2>
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
        <div className="commands">
          <span
            className="button review-privacy"
            onClick={this.props.reviewPrivacyPolicy}
          >
            Review Privacy Policy
          </span>
          <span
            className="button repeat-tutorial"
            onClick={this.props.repeatTutorial}
          >
            Repeat Tutorial
          </span>
        </div>
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
