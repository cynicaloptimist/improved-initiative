export interface PatreonPostAttributes {
  title: string;
  content: string;
  url: string;
  created_at: string;
  was_posted_by_campaign_owner: boolean;
}

export interface PatreonPost {
  attributes: PatreonPostAttributes;
  id: string;
  type: string;
}
