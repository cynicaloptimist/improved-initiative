import * as React from "react";
import { env } from "../Environment";
import { Metrics } from "../Utility/Metrics";

export function BannerHost(): JSX.Element {
  if (env.IsLoggedIn && (env.HasStorage || env.HasEpicInitiative)) {
    return null;
  }

  const href =
    "https://www.dmsguild.com/browse.php?filters=45680_0_0_0_0_0&affiliate_id=282190";

  return (
    <div className="footer-banner">
      <a
        href={href}
        target="_blank"
        onClick={() => Metrics.TrackAnonymousEvent("BannerClick", { href })}
      >
        <img
          src="https://www.dmsguild.com/images/site_resources/DMsGuild-GuildAdept-Banner-sm.png"
          alt="Guild Adept PDFs - Available exclusively @ Dungeon Masters Guild"
        />
      </a>
    </div>
  );
}
