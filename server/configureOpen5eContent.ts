import axios from "axios";
import * as express from "express";

import * as _ from "lodash";

import { ListingMeta } from "../common/Listable";
import { Req, Res } from "./routes";
import { normalizeChallengeRating } from "../common/Toolbox";

export async function configureOpen5eContent(
  app: express.Application
): Promise<void> {
  if (process.env.SKIP_OPEN5E_API) {
    console.log("Skipping Open5e API requests due to environment setting.");
    app.get("/open5e/", (req: Req, res: Res) => {
      res.json({
        monsterSources: {},
        spellSources: {}
      });
    });
    return;
  }

  if (process.env.OPEN5E_API_LIMIT) {
    console.log(
      `Using Open5e API limit from environment: ${process.env.OPEN5E_API_LIMIT}`
    );
  }

  const includeMonsterFields =
    "name,key,size,type,alignment,challenge_rating,document";
  const includeSpellFields =
    "name,slug,level,school,document__title,document__slug";

  const monstersSourceUrl = `https://api.open5e.com/v2/creatures/?limit=500&fields=${includeMonsterFields}`;
  const spellsSourceUrl = `https://api.open5e.com/v1/spells/?limit=500&fields=${includeSpellFields}`;

  console.log("Loading Open5e monsters");
  const monsterListingsBySource = await getAllListings(
    monstersSourceUrl,
    getMetaForMonster
  );

  console.log("Loading Open5e spells");
  const spellListingsBySource = await getAllListings(
    spellsSourceUrl,
    getMetaForSpell
  );

  app.get("/open5e/", (req: Req, res: Res) => {
    const monsterSources = _.mapValues(
      monsterListingsBySource,
      v => v.sourceTitle
    );
    const spellSources = _.mapValues(spellListingsBySource, v => v.sourceTitle);
    res.json({
      monsterSources,
      spellSources
    });
  });

  for (const sourceSlug in monsterListingsBySource) {
    app.get(`/open5e/${sourceSlug}/`, (req: Req, res: Res) => {
      res.json(monsterListingsBySource[sourceSlug].listings);
    });
  }

  for (const sourceSlug in spellListingsBySource) {
    app.get(`/open5e-spells/${sourceSlug}/`, (req: Req, res: Res) => {
      res.json(spellListingsBySource[sourceSlug].listings);
    });
  }
}

type ListingsWithSourceTitle = {
  sourceTitle: string;
  listings: ListingMeta[];
};

async function getAllListings(
  sourceUrl: string,
  createListingMeta: (r: any) => ListingMeta
): Promise<Record<string, ListingsWithSourceTitle>> {
  let nextUrl = sourceUrl;
  const listingsBySource: Record<string, ListingsWithSourceTitle> = {};
  const apiLimit = process.env.OPEN5E_API_LIMIT
    ? parseInt(process.env.OPEN5E_API_LIMIT)
    : null;
  let totalLoaded = 0;

  do {
    console.log("Loading " + nextUrl);
    try {
      const response = await axios.get(nextUrl);
      const newListingsBySlug = _.groupBy(
        response.data.results,
        r => (r.document__slug as string) ?? (r.document.key as string)
      );
      totalLoaded += response.data.results.length;

      for (const slug in newListingsBySlug) {
        const listingMetas = newListingsBySlug[slug].map(createListingMeta);
        if (listingsBySource[slug]) {
          listingsBySource[slug].listings.push(...listingMetas);
        } else if (listingMetas.length) {
          listingsBySource[slug] = {
            sourceTitle: listingMetas[0].FilterDimensions.Source ?? "unknown",
            listings: listingMetas
          };
        }
      }

      nextUrl = response.data?.next;
    } catch (e) {
      console.warn("Problem loading content", JSON.stringify(e));
    }
  } while (nextUrl && (apiLimit === null || totalLoaded < apiLimit));
  console.log("Done.");

  return listingsBySource;
}

function getMetaForMonster(r: any): ListingMeta {
  const listingMeta: ListingMeta = {
    Id: "open5e-" + r.key,
    Name: r.name,
    Path: "",
    Link: `https://api.open5e.com/v2/creatures/${r.key}/`,
    LastUpdateMs: 0,
    SearchHint: `${r.name} ${r.type.name} ${r.alignment}`
      .toLocaleLowerCase()
      .replace(/[^\w\s]/g, ""),
    FilterDimensions: {
      Level: normalizeChallengeRating(r.challenge_rating),
      Source: r.document.display_name,
      Type: `${r.type.name}`
    }
  };
  return listingMeta;
}

function getMetaForSpell(r: any): ListingMeta {
  const listingMeta: ListingMeta = {
    Id: "open5e-spell-" + r.slug,
    Name: r.name,
    Path: "",
    Link: `https://api.open5e.com/v1/spells/${r.slug}/`,
    LastUpdateMs: 0,
    SearchHint: `${r.name} ${r.level} ${r.school}`
      .toLocaleLowerCase()
      .replace(/[^\w\s]/g, ""),
    FilterDimensions: {
      Level: r.level,
      Source: r.document__title,
      Type: r.school
    }
  };
  return listingMeta;
}
