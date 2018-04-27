import * as React from "react";
import { ChangeEvent } from "react";
import { PlayerViewCustomStyles, PlayerViewSettings } from "../../../common/PlayerViewSettings";
import { PlayerViewCustomStyles } from "../../../common/PlayerViewSettings";
import { StylesChooser } from "./StylesChooser";

export interface EpicInitiativeSettingsProps {
    playerViewSettings: PlayerViewSettings;
}

interface State {
    manualCSS: string;
}

export class EpicInitiativeSettings extends React.Component<EpicInitiativeSettingsProps, State> {
    constructor(props: EpicInitiativeSettingsProps) {
        super(props);
        this.state = {
            manualCSS: this.props.playerViewSettings.CustomCSS
        };
    }

    private updateCSS = (event: ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({ manualCSS: event.target.value });
        this.props.playerViewSettings.CustomCSS = event.target.value;
    }

    private updateStyle = (name: keyof PlayerViewCustomStyles, value: string) => {
        this.props.playerViewSettings.CustomStyles[name] = value;
    }

    public render() {
        return <div className="c-epic-initiative-settings">
            <p>Epic Initiative is enabled.</p>
            <h4>Player View Display Settings</h4>
            <StylesChooser currentStyles={this.props.currentStyles} updateStyle={this.props.updateStyle} />
            <h4>Additional CSS <strong>(experimental)</strong></h4>
            <textarea rows={10} onChange={this.updateCSS} value={this.state.manualCSS} />
        </div>;
    }
}
