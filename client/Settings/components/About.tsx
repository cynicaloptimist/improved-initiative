import * as React from "react";
import { Button } from "../../Components/Button";
import { env } from "../../Environment";
import { TipCarousel } from "./TipCarousel";

interface AboutProps {
  repeatTutorial: () => void;
  reviewPrivacyPolicy: () => void;
}

export class About extends React.Component<AboutProps> {
  public render() {
    return (
      <div className="tab-content about">
        <div>
          <p>
            <strong>Improved Initiative</strong>
            {" was created by "}
            <a href="mailto:improvedinitiativedev@gmail.com">Evan Bailey</a>
            {". All Wizards of the Coast content provided under terms of the "}
            <a href={env.BaseUrl + "/SRD-OGL_V1.1.pdf"} target="_blank">
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
        <TipCarousel />
        <div className="commands">
          <span
            className="button review-privacy"
            onClick={this.props.reviewPrivacyPolicy}
          >
            Review Privacy Policy
          </span>
          <Button
            additionalClassNames="repeat-tutorial"
            fontAwesomeIcon="hat-wizard"
            text="Repeat Tutorial"
            onClick={this.props.repeatTutorial}
          />
        </div>
        <div className="about__version">
          Version {process.env.VERSION || "unknown"}
        </div>
      </div>
    );
  }
}
