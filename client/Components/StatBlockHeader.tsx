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
        const maybeLargePortrait = this.props.ImageUrl && this.state.portraitSize == "full" &&
            <img className={`portrait-${this.state.portraitSize}`} onClick={this.togglePortraitSize} src={this.props.ImageUrl} />;

        let header = <h3 className="Name">{this.props.Name}</h3>;

        if (this.props.ImageUrl && this.state.portraitSize == "thumbnail") {
            header = <h3 className="Name">
                {this.props.Name}
                <img className={`portrait-${this.state.portraitSize}`} onClick={this.togglePortraitSize} src={this.props.ImageUrl} />
            </h3>;
        }

        return <div className="c-statblock-header">
            {maybeLargePortrait}
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
