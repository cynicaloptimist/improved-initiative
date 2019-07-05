import _ = require("lodash");
import * as React from "react";
import { Listable } from "../../../common/Listable";
import { linkComponentToObservables } from "../../Combatant/linkComponentToObservables";
import { Listing } from "../Listing";
import { ListingButton } from "./ListingButton";

export interface ListingProps<T extends Listable> {
  name: string;
  listing: Listing<T>;
  onAdd: (listing: Listing<T>, modified: boolean) => boolean;
  onDelete?: (listing: Listing<T>) => void;
  onEdit?: (listing: Listing<T>) => void;
  onMove?: (listing: Listing<T>) => void;
  onPreview?: (
    listing: Listing<T>,
    e: React.MouseEvent<HTMLDivElement>
  ) => void;
  onPreviewOut?: (listing: Listing<T>) => void;
  showCount?: boolean;
}

interface ListingState {
  count: number;
}

export class ListingRow<T extends Listable> extends React.Component<
  ListingProps<T>,
  ListingState
> {
  private addFn = async (event: React.MouseEvent<HTMLSpanElement>) => {
    const didAdd = this.props.onAdd(this.props.listing, event.altKey);
    if (didAdd && this.props.showCount) {
      const currentCount = (this.state && this.state.count) || 0;
      this.setState({
        count: currentCount + 1
      });
    }
  };
  private deleteFn = () => this.props.onDelete(this.props.listing);
  private editFn = () => this.props.onEdit(this.props.listing);
  private moveFn = () => this.props.onMove(this.props.listing);
  private previewFn = e => this.props.onPreview(this.props.listing, e);
  private previewOutFn = () => this.props.onPreviewOut(this.props.listing);

  constructor(props) {
    super(props);
    linkComponentToObservables(this);
  }

  public render() {
    const addedCount = this.props.showCount && this.state && this.state.count;
    const countElements = addedCount
      ? _.range(addedCount).map(i => (
          <span className="c-listing__counter" key={i}>
            ●
          </span>
        ))
      : "";
    return (
      <li className="c-listing">
        <ListingButton
          buttonClass="add"
          text={this.props.name}
          onClick={this.addFn}
        >
          {countElements}
        </ListingButton>
        {this.props.onDelete && (
          <ListingButton
            buttonClass="delete"
            faClass="trash"
            onClick={this.deleteFn}
          />
        )}
        {this.props.onEdit && (
          <ListingButton
            buttonClass="edit"
            faClass="edit"
            onClick={this.editFn}
          />
        )}
        {this.props.onMove && (
          <ListingButton
            buttonClass="move"
            faClass="folder"
            onClick={this.moveFn}
          />
        )}
        {this.props.onPreview && (
          <ListingButton
            buttonClass="preview"
            faClass="search"
            onClick={this.previewFn}
            onMouseEnter={this.previewFn}
            onMouseLeave={this.previewOutFn}
          />
        )}
      </li>
    );
  }
}
