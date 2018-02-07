import * as React from "react";
import { Listable } from "../../../common/Listable";
import { Listing } from "../Listing";
import { ListingButton } from "./ListingButton";

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
        return <li>
            <ListingButton text={this.props.name} onClick={this.addFn} />
            {this.props.onEdit && <ListingButton faClass="edit" onClick={this.editFn} />}
            {this.props.onDelete && <ListingButton faClass="trash" onClick={this.deleteFn} />}
            {this.props.onPreview && <ListingButton faClass="search" onClick={this.previewFn} onMouseOver={this.previewFn} />}
        </li>;
    }
}
