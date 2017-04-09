import appInsights = require("applicationinsights");

export default function () {
    if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
        appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY).start();
    }
}
