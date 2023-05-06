import * as React from "react";

import { getDefaultSettings } from "../../common/Settings";

export const SettingsContext = React.createContext(getDefaultSettings());
