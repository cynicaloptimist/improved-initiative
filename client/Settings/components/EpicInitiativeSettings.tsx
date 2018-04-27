import * as React from "react";
import { ChangeEvent } from "react";
import { PlayerViewCustomStyles } from "../../../common/PlayerViewSettings";
import { StylesChooser } from "./StylesChooser";

export interface EpicInitiativeSettingsProps {
    currentCSS: string;
    currentStyles: PlayerViewCustomStyles;
    updateCSS: (css: string) => void;
    updateStyle: (name: keyof PlayerViewCustomStyles, value: string) => void;
}

interface State {
    manualCSS: string;
}

export class EpicInitiativeSettings extends React.Component<EpicInitiativeSettingsProps, State> {
    constructor(props: EpicInitiativeSettingsProps) {
        super(props);
        this.state = {
            manualCSS: this.props.currentCSS
        };
    }

    private updateCSS = (event: ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({ manualCSS: event.target.value });
        this.props.updateCSS(event.target.value);
    }

    public render() {
        return <div className="c-epic-initiative-settings">
            <p>Epic Initiative is enabled.</p>
            <StylesChooser currentStyles={this.props.currentStyles} updateStyle={this.props.updateStyle} />
            <h4>Additional CSS <strong>(experimental)</strong></h4>
            <textarea rows={10} onChange={this.updateCSS} value={this.state.manualCSS} />
        </div>;
    }
}
