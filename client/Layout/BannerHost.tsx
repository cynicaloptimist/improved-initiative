import * as React from "react";
import { env } from "../Environment";
import { Metrics } from "../Utility/Metrics";

export function BannerHost(): JSX.Element {
  if (env.IsLoggedIn && (env.HasStorage || env.HasEpicInitiative)) {
    return null;
  }

  const href = "https://www.drivethrurpg.com/browse.php?affiliate_id=282190";

  return (
    <div className="footer-banner">
      <a
        href={href}
        target="_blank"
        onClick={() => Metrics.TrackAnonymousEvent("BannerClick", { href })}
      >
        <img
          src="https://www.drivethrurpg.com/themes/dtrpg/images/affiliatebanner10.png"
          alt="Indie RPGs at DriveThruRPG.com"
        />
      </a>
    </div>
  );
}
