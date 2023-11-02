import * as React from "react";
import * as _ from "lodash";

import { Toggle } from "./Toggle";
import { useRequest } from "../../Utility/useRequest";

export function ContentSettings() {
  const contentSources = useRequest("/open5e/");
  if (contentSources.loading) {
    return <div className="tab-content content">Loading Sources...</div>;
  }
  if (contentSources.error) {
    return (
      <div className="tab-content content">
        Error loading sources: {contentSources.error}
      </div>
    );
  }

  const sourceKeys = _.sortBy(Object.keys(contentSources.data), k => {
    if (k === "wotc-srd") {
      return 0;
    }
    return contentSources.data[k];
  });

  const sourceToggle = (sourceName: string) => (
    <Toggle
      key={`toggle-${sourceName}`}
      fieldName={`PreloadedStatBlockSources.${sourceName}`}
    >
      {contentSources.data[sourceName]}
    </Toggle>
  );

  return (
    <div className="tab-content content">
      <h3>Preloaded Content</h3>
      <h2>Creature Statblocks</h2>
      {sourceKeys.map(sourceToggle)}
      <p style={{ fontWeight: "bold" }}>
        Reload the app after saving your Preloaded Content changes.
      </p>
    </div>
  );
}
