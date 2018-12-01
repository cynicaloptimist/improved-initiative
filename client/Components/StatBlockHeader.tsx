import * as React from "react";

interface StatBlockHeaderProps {
    Name: string;
    ImageUrl?: string;
}

interface StatBlockHeaderState {
    portraitSize: "thumbnail" | "full";
}

export class StatBlockHeader extends React.Component<StatBlockHeaderProps, StatBlockHeaderState> {
    constructor(props) {
        super(props);
        this.state = { portraitSize: "thumbnail" };
    }

    public render() {
        let header = <h3 className="Name">{this.props.Name}</h3>;

        if (this.props.ImageUrl) {
            header = <div className={`c-statblock-header__name-and-portrait--${this.state.portraitSize}`}>
                <img className={`c-statblock-header__portrait`} onClick={this.togglePortraitSize} src={this.props.ImageUrl} />
                <h3>{this.props.Name}</h3>
            </div>;
        }

        return <div className="c-statblock-header">
            {header}
        </div>;
    }

    private togglePortraitSize = () => {
        if (this.state.portraitSize == "thumbnail") {
            this.setState({ portraitSize: "full" });
        } else {
            this.setState({ portraitSize: "thumbnail" });
        }
    }
}
