import * as React from "react";
import { MouseEvent } from "react";
import { Listing, Listable } from "../Listing";
import { Button } from "./Button";

export interface ListingProps<T extends Listable>  {
    name: string;
    listing: Listing<T>;
    onAdd: (item: T) => void;
}

export class ListingViewModel<T extends Listable> extends React.Component<ListingProps<T>> {
    private getListingAndAdd = () => {
        this.props.listing.GetAsync(this.props.onAdd);
    }

    public render() {
        return <li key={this.props.listing.Id}><Button name={this.props.name} onClick={this.getListingAndAdd}/></li>;
    }
}
