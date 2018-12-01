import * as React from "react";

interface StatBlockHeaderProps {
    Name: string;
    ImageUrl?: string;
}

interface StatBlockHeaderState {
    portraitSize: "thumbnail" | "full";
}

export class StatBlockHeader extends React.Component<StatBlockHeaderProps, StatBlockHeaderState> {
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

        return <React.Fragment>
            {maybeLargePortrait}
            {header}
        </React.Fragment>;
    }

    private togglePortraitSize = () => {
        if (this.state.portraitSize == "thumbnail") {
            this.setState({ portraitSize: "full" });
        } else {
            this.setState({ portraitSize: "thumbnail" });
        }
    }
}
