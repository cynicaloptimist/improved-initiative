import * as React from "react";
import { Button } from "../../Components/Button";
import { Overlay } from "../../Components/Overlay";
import { LibraryFilter } from "./LibraryFilter";

interface LibraryPaneProps {
  listingAndFolderComponents: JSX.Element[];
  applyFilter: (filter: string) => void;
  toggleGroupBy: () => void;
  hideLibraries: () => void;
  addNewItem: () => void;
  handlePreviewMouseEvent: (e: React.MouseEvent<HTMLDivElement>) => void;
  previewVisible: boolean;
  previewPosition: {
    left: number;
    top: number;
  };
  previewComponent: JSX.Element;
}

export class LibraryPane extends React.Component<LibraryPaneProps> {
  public render() {
    return (
      <div className="library">
        <div className="search-controls">
          <LibraryFilter applyFilterFn={this.props.applyFilter} />
          <Button
            additionalClassNames="group-by"
            fontAwesomeIcon="sort"
            onClick={this.props.toggleGroupBy}
          />
        </div>
        <ul className="listings">{this.props.listingAndFolderComponents}</ul>
        <div className="buttons">
          <Button
            additionalClassNames="hide"
            fontAwesomeIcon="chevron-up"
            onClick={this.props.hideLibraries}
          />
          <Button
            additionalClassNames="new"
            fontAwesomeIcon="plus"
            onClick={this.props.addNewItem}
          />
        </div>
        {this.props.previewVisible && (
          <Overlay
            handleMouseEvents={this.props.handlePreviewMouseEvent}
            maxHeightPx={300}
            left={this.props.previewPosition.left}
            top={this.props.previewPosition.top}
          >
            {this.props.previewComponent}
          </Overlay>
        )}
      </div>
    );
  }
}
