import * as React from "react";
import { MouseEvent } from "react";
import { Listable } from "../Listing";
import { Button } from "./Button";

export interface ListingProps<T extends Listable>  {
    name: string;
    listing: T;
    onAdd: (listing: T) => void;
}

export class ListingViewModel<T extends Listable> extends React.Component<ListingProps<T>> {
    public render() {
        return <li key={this.props.listing.Id}><Button name={this.props.name} onClick={() => this.props.onAdd(this.props.listing)}/></li>;
    }
}
