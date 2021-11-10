import axios from "axios";
import express = require("express");
import _ = require("lodash");
import { ListingMeta } from "../common/Listable";
import { Req, Res } from "./routes";

export function configureOpen5eContent(app: express.Application) {
  const getMeta: (remoteItem: any) => ListingMeta = r => {
    const listingMeta: ListingMeta = {
      Id: "open5e-" + r.slug,
      Name: r.name,
      Path: "",
      Link: `https://api.open5e.com/monsters/${r.slug}`,
      LastUpdateMs: 0,
      SearchHint: `${r.name}
                   ${r.type}
                   ${r.subtype}
                   ${r.alignment}`
        .toLocaleLowerCase()
        .replace(/[^\w\s]/g, ""),
      FilterDimensions: {
        Level: r.challenge_rating,
        Source: r.document__title,
        Type: `${r.type} (${r.subtype})`
      }
    };
    return listingMeta;
  };

  const includeFields =
    "name,slug,size,type,subtype,alignment,challenge_rating,document__title,document__slug";

  const sourceUrl = `https://api.open5e.com/monsters/?limit=1500&fields=${includeFields}`;

  let basicRulesListings: ListingMeta[] = [];
  let additionalListings: ListingMeta[] = [];
  axios
    .get(sourceUrl)
    .then(response => {
      if (Array.isArray(response?.data?.results)) {
        const [basicRulesResults, additionalResults] = _.partition(
          response.data.results,
          r => r.document__slug == "wotc-srd"
        );
        basicRulesListings = basicRulesResults.map(getMeta);
        additionalListings = additionalResults.map(getMeta);
      }
    })
    .catch(error => {
      console.warn("Could not cache open5e index: ", error);
    });

  app.get("/open5e/basicrules/", (req: Req, res: Res) => {
    res.json(basicRulesListings);
  });

  app.get("/open5e/additionalcontent/", (req: Req, res: Res) => {
    res.json(additionalListings);
  });
}
