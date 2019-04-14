export interface Listable {
  Id: string;
  Version: string;
  Name: string;
  Path: string;
}

export interface ListingMetadata {
  Level?: string;
}

export interface StoredListing {
  Id: string;
  Link: string;
  Name: string;
  SearchHint: string;
  Metadata: ListingMetadata;
  Path: string;
}
