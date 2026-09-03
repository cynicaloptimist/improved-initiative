import * as _ from "lodash";

import * as React from "react";
import { Listable } from "../../../common/Listable";
import { linkComponentToObservables } from "../../Combatant/linkComponentToObservables";
import { Listing } from "../Listing";
import { RenameResult } from "../RenameResult";
import { InlineNameEditor } from "./InlineNameEditor";
import { ListingButton } from "./ListingButton";

export interface ExtraButton<T extends Listable> {
  title: string;
  buttonClass: string;
  faClass: string;
  onClick: (listing: Listing<T>, modified?: boolean) => void;
}

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
  extraButtons?: ExtraButton<T>[];
  showCount?: boolean;
  showSource?: boolean;
  /** Persists a rename and reports a recoverable result to the editor. */
  onRename?: (listing: Listing<T>, newName: string) => Promise<RenameResult>;
}

interface ListingState {
  count: number;
  isRenaming?: boolean;
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
  private makeExtraButtonFn = (extraButton: ExtraButton<T>) => {
    if (!extraButton.onClick) {
      return undefined;
    }

    return (event: React.MouseEvent<HTMLSpanElement>) => {
      extraButton.onClick(this.props.listing, event.altKey);
    };
  };

  constructor(props) {
    super(props);
    linkComponentToObservables(this);
  }

  public render(): JSX.Element {
    const addedCount = this.props.showCount && this.state && this.state.count;
    const countElements = addedCount
      ? _.range(addedCount).map(i => (
          <span className="c-listing__counter" key={i}>
            ●
          </span>
        ))
      : "";

    const listingName = this.props.listing.Meta().Name;
    let displayName = listingName;
    if (this.props.showSource) {
      const source = this.props.listing.Meta().FilterDimensions.Source;
      if (source?.length) {
        displayName += ` (${source})`;
      }
    }

    const extraButtons = this.props.extraButtons || [];
    return (
      <li className="c-listing">
        {this.state?.isRenaming ? (
          <InlineNameEditor
            name={listingName}
            onCancel={() => this.setState({ isRenaming: false })}
            onCommit={(newName) => this.props.onRename(this.props.listing, newName)}
          />
        ) : (
          <ListingButton
            buttonClass="add c-listing-button--wide"
            text={displayName}
            onClick={this.addFn}
          >
            {countElements}
          </ListingButton>
        )}
        {extraButtons.map((button, index) => (
          <ListingButton
            key={index}
            title={button.title}
            buttonClass={button.buttonClass}
            faClass={button.faClass}
            onClick={this.makeExtraButtonFn(button)}
          />
        ))}
        {this.props.onRename && (
          <ListingButton
            title="Rename"
            buttonClass="edit"
            faClass="i-cursor"
            onClick={() => this.setState({ isRenaming: true })}
          />
        )}
        {this.props.onDelete && (
          <ListingButton
            title="Delete"
            buttonClass="delete"
            faClass="trash"
            onClick={this.deleteFn}
          />
        )}
        {this.props.onEdit && (
          <ListingButton
            title="Edit"
            buttonClass="edit"
            faClass="edit"
            onClick={this.editFn}
          />
        )}
        {this.props.onMove && (
          <ListingButton
            title="Move"
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
