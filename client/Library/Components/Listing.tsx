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
    showCount?: boolean;
}

interface ListingState {
    count: number;
}

export class ListingViewModel<T extends Listable> extends React.Component<ListingProps<T>, ListingState> {
    private addFn = (event: React.MouseEvent<HTMLSpanElement>) => {
        this.props.onAdd(this.props.listing, event.altKey);
        if (this.props.showCount) {
            const currentCount = this.state && this.state.count || 0;
            this.setState({
                count: currentCount + 1
            });
        }
    }
    private deleteFn = () => this.props.onDelete(this.props.listing);
    private editFn = () => this.props.onEdit(this.props.listing);
    private moveFn = () => this.props.onMove(this.props.listing);
    private previewFn = e => this.props.onPreview(this.props.listing, e);
    private previewOutFn = () => this.props.onPreviewOut(this.props.listing);

    public render() {
        return <li className="c-listing">
            <ListingButton buttonClass="add" text={this.props.name} onClick={this.addFn} />
            {this.props.showCount && this.state && this.state.count}
            {this.props.onDelete && <ListingButton buttonClass="delete" faClass="trash" onClick={this.deleteFn} />}
            {this.props.onEdit && <ListingButton buttonClass="edit" faClass="edit" onClick={this.editFn} />}
            {this.props.onMove && <ListingButton buttonClass="move" faClass="folder" onClick={this.moveFn} />}
            {this.props.onPreview && <ListingButton buttonClass="preview" faClass="search" onClick={this.previewFn} onMouseEnter={this.previewFn} onMouseLeave={this.previewOutFn} />}
        </li>;
    }
}
