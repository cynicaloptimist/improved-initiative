import * as React from "react";
import { Listable } from "../../../common/Listable";
import { Listing } from "../Listing";
import { ListingButton } from "./ListingButton";

export interface ListingProps<T extends Listable> {
    name: string;
    listing: Listing<T>;
    onAdd: (listing: Listing<T>, modified: boolean) => void;
    onDelete?: (listing: Listing<T>) => void;
    onEdit?: (listing: Listing<T>) => void;
    onMove?:  (listing: Listing<T>) => void;
    onPreview?: (listing: Listing<T>, e: React.MouseEvent<HTMLDivElement>) => void;
    onPreviewOut?: (listing: Listing<T>) => void;
}

export class ListingViewModel<T extends Listable> extends React.Component<ListingProps<T>> {
    private addFn = (event: React.MouseEvent<HTMLSpanElement>) => {
        this.props.onAdd(this.props.listing, event.altKey);
    }
    private deleteFn = () => this.props.onDelete(this.props.listing);
    private editFn = () => this.props.onEdit(this.props.listing);
    private moveFn = () => this.props.onMove(this.props.listing);
    private previewFn = e => this.props.onPreview(this.props.listing, e);
    private previewOutFn = () => this.props.onPreviewOut(this.props.listing);

    public render() {
        return <li className="c-listing">
            <ListingButton text={this.props.name} onClick={this.addFn} />
            {this.props.onDelete && <ListingButton buttonClass="trash" onClick={this.deleteFn} />}
            {this.props.onEdit && <ListingButton buttonClass="edit" onClick={this.editFn} />}
            {this.props.onMove && <ListingButton buttonClass="folder" onClick={this.moveFn} />}
            {this.props.onPreview && <ListingButton buttonClass="search" onClick={this.previewFn} onMouseEnter={this.previewFn} onMouseLeave={this.previewOutFn} />}
        </li>;
    }
}
