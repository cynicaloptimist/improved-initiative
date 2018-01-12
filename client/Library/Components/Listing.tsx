import * as React from "react";
import { MouseEvent } from "react";
import { Listing, Listable } from "../Listing";
import { Button } from "./Button";

export interface ListingProps<T extends Listable> {
    name: string;
    listing: Listing<T>;
    onAdd: (listing: Listing<T>) => void;
    onDelete?: (listing: Listing<T>) => void;
    onEdit?: (listing: Listing<T>) => void;
    onPreview?: (listing: Listing<T>) => void;
}

export class ListingViewModel<T extends Listable> extends React.Component<ListingProps<T>> {
    private addFn = () => this.props.onAdd(this.props.listing);
    private deleteFn = () => this.props.onDelete(this.props.listing);
    private editFn = () => this.props.onEdit(this.props.listing);
    private previewFn = () => this.props.onPreview(this.props.listing);

    public render() {
        return <li key={this.props.listing.Id}>
            <Button text={this.props.name} onClick={this.addFn} />
            {this.editFn && <Button faClass="edit" onClick={this.editFn} />}
            {this.deleteFn && <Button faClass="trash" onClick={this.deleteFn} />}
            {this.previewFn && <Button faClass="search" onClick={this.previewFn} onMouseOver={this.previewFn} />}
        </li>;
    }
}
