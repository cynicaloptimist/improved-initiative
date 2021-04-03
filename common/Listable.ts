export interface Listable {
  Id: string;
  Version: string;
  Name: string;
  Path: string;
  LastUpdateMs?: number;
}

// Listings can be grouped or filtered by their FilterDimensions.
export interface FilterDimensions {
  Level?: string;
  Source?: string;
  Type?: string;
}

export interface StoredListing {
  Id: string;
  Link: string;
  Name: string;
  SearchHint: string;
  FilterDimensions: FilterDimensions;
  Path: string;
  LastUpdateMs: number;
}
