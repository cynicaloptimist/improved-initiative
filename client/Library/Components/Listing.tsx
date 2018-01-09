import * as React from "react";

export interface ListingProps  {
    name: string;
}

export class Listing extends React.Component<ListingProps> {
    public render() {
        return <li>{this.props.name}</li>;
    }
}
