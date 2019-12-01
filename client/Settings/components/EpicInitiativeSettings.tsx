import { Field, FieldProps } from "formik";
import * as React from "react";
import { Button } from "../../Components/Button";
import { env } from "../../Environment";
import { StylesChooser } from "./StylesChooser";
import { Toggle } from "./Toggle";

export function EpicInitiativeSettings() {
  if (!env.IsLoggedIn) {
    return loginMessage();
  }

  if (!env.HasEpicInitiative) {
    return upgradeMessage();
  }

  return (
    <div className="tab-content epicInitiative">
      <h3>Epic Initiative</h3>
      <p>
        <strong>Thank you for supporting Improved Initiative!</strong>
      </p>
      <Button
        text="Get the D&amp;D Beyond StatBlock Importer"
        additionalClassNames="get-importer-extension"
        onClick={() =>
          window.open("https://www.patreon.com/posts/31705918", "_blank)")
        }
      />
      <h4>Additional Player View Settings</h4>
      <Toggle fieldName="PlayerView.DisplayPortraits">
        Show combatant portraits
      </Toggle>
      <Toggle fieldName="PlayerView.SplashPortraits">
        Show turn start portrait splash
      </Toggle>
      <Toggle fieldName="PlayerView.AllowTagSuggestions">
        Allow players to suggest tags
      </Toggle>
      <StylesChooser />
      <h4>Other Styles</h4>
      <Field name="PlayerView.CustomStyles.font">
        {(fieldProps: FieldProps) => (
          <div className="c-input-with-label">
            <span style={{ fontFamily: fieldProps.field.value }}>
              Font Family
            </span>
            <input {...fieldProps.field} />
          </div>
        )}
      </Field>

      <div className="c-input-with-label">
        Background Image URL
        <Field name="PlayerView.CustomStyles.backgroundUrl" />
      </div>

      <h4>
        Additional Player View CSS <strong>(experimental)</strong>
      </h4>
      <Field component="textarea" rows={10} name="PlayerView.CustomCSS" />
    </div>
  );
}

function loginMessage() {
  return (
    <div className="tab-content epicInitiativeLogin">
      <h3>Epic Initiative</h3>
      <p>Log in with Patreon to access patron benefits.</p>
      {epicInitiativeFeatures()}
      <hr />
      <a className="login button" href={env.PatreonLoginUrl}>
        Log In with Patreon
      </a>
    </div>
  );
}

function upgradeMessage() {
  return (
    <div className="tab-content epicInitiativeLogin">
      <h3>Epic Initiative</h3>
      <p>
        You're logged in with Patreon, but you have not selected the Epic
        Initiative reward level.
      </p>
      {epicInitiativeFeatures()}
      <hr />
      <Button
        onClick={() =>
          window.open(
            "https://www.patreon.com/bePatron?c=716070&rid=1937132",
            "_blank"
          )
        }
        additionalClassNames="button--upgrade"
        text="Pledge Now!"
      />
    </div>
  );
}

function epicInitiativeFeatures() {
  return (
    <ul className="bulleted">
      <li>Get access to the D&amp;D Beyond Stat Block Importer</li>
      <li>Player View Enhancements:</li>
      <ul className="bulleted">
        <li>
          Customize the look and feel of your Player View with colors and CSS
        </li>
        <li>Display Combatant Portraits and Encounter Background Images</li>
        <li>Players can suggest Tags for any combatant</li>
      </ul>
    </ul>
  );
}
