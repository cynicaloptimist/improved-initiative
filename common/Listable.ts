export interface Listable {
  Id: string;
  Version: string;
  Name: string;
  Path: string;
  LastUpdateMs?: number;
}

export interface ListingMetadata {
  Level?: string;
  Source?: string;
  Type?: string;
}

export interface StoredListing {
  Id: string;
  Link: string;
  Name: string;
  SearchHint: string;
  Metadata: ListingMetadata;
  Path: string;
  LastUpdateMs: number;
}
